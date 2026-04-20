/**
 * translate-arabic.mjs
 * Traduit description_ar depuis description_fr via OpenAI gpt-4o-mini
 * Version corrigée : traduit TOUTES les villas (ignore le contenu actuel de description_ar)
 *
 * Prérequis :
 *   npm install @supabase/supabase-js openai
 *
 * Usage :
 *   SUPABASE_URL=... SUPABASE_KEY=... OPENAI_API_KEY=... node translate-arabic.mjs
 *
 * Options (variables d'env) :
 *   DRY_RUN=true   → affiche ce qui serait fait sans écrire en base
 *   BATCH_SIZE=5   → nombre de traductions en parallèle (défaut: 5)
 *   LIMIT=10       → limiter à N villas pour tester (défaut: toutes)
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ─── Configuration ────────────────────────────────────────────────────────────

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_KEY     = process.env.SUPABASE_KEY;     // service role key
const OPENAI_API_KEY   = process.env.OPENAI_API_KEY;
const DRY_RUN          = process.env.DRY_RUN === 'true';
const BATCH_SIZE       = parseInt(process.env.BATCH_SIZE || '5');
const LIMIT            = process.env.LIMIT ? parseInt(process.env.LIMIT) : null;

// ─── Validation ───────────────────────────────────────────────────────────────

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  console.error(`
❌ Variables d'environnement manquantes.

Lancez le script ainsi :
  SUPABASE_URL=https://xxxx.supabase.co \\
  SUPABASE_KEY=eyJ... \\
  OPENAI_API_KEY=sk-... \\
  node translate-arabic.mjs

Options supplémentaires :
  DRY_RUN=true      → test sans écriture
  LIMIT=10          → traiter seulement 10 villas
  BATCH_SIZE=5      → parallélisme (défaut: 5)
`);
  process.exit(1);
}

// ─── Clients ──────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai   = new OpenAI({ apiKey: OPENAI_API_KEY });

// ─── Traduction ───────────────────────────────────────────────────────────────

async function translateToArabic(frenchText, ref) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: `Tu es un traducteur immobilier professionnel français → arabe.
Règles strictes :
- Traduis UNIQUEMENT en arabe standard moderne (MSA)
- Conserve exactement les balises HTML (<p>, <p class="title">, etc.)
- Ne traduis PAS le contenu des attributs HTML
- Adapte la typographie arabe (ponctuation, espaces)
- Ne rajoute aucun commentaire, traduis directement`
      },
      {
        role: 'user',
        content: frenchText
      }
    ]
  });

  return response.choices[0].message.content.trim();
}

// ─── Logique principale ───────────────────────────────────────────────────────

async function main() {
  console.log(`
╔══════════════════════════════════════════════╗
║     Traduction arabe — Villas Supabase       ║
║     Version complète (traduction forcée)     ║
╚══════════════════════════════════════════════╝
  Mode   : ${DRY_RUN ? '🔍 DRY RUN (aucune écriture)' : '✍️  ÉCRITURE en base'}
  Batch  : ${BATCH_SIZE} traductions en parallèle
  ${LIMIT ? `Limite  : ${LIMIT} villas` : 'Limite  : TOUTES les villas (ignore le contenu actuel de description_ar)'}
`);

  // 1. Récupérer TOUTES les villas avec description_fr non-nulle
  //    (ignore complètement le contenu actuel de description_ar)
  let query = supabase
    .from('villas')
    .select('id, ref, description_fr')
    .not('description_fr', 'is', null)
    .neq('description_fr', '')
    .order('ref', { ascending: true });

  if (LIMIT) {
    query = query.limit(LIMIT);
  }

  const { data: villas, error } = await query;

  if (error) {
    console.error('❌ Erreur Supabase lors de la récupération :', error.message);
    process.exit(1);
  }

  if (!villas || villas.length === 0) {
    console.log('✅ Aucune villa avec description_fr trouvée. Rien à faire.');
    process.exit(0);
  }

  console.log(`📋 ${villas.length} villa(s) à traduire\n`);

  // 2. Traitement par batches
  let success = 0;
  let failed  = 0;
  const errors = [];

  for (let i = 0; i < villas.length; i += BATCH_SIZE) {
    const batch = villas.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(villas.length / BATCH_SIZE);

    process.stdout.write(
      `⏳ Batch ${batchNum}/${totalBatches} (villas ${i + 1}–${Math.min(i + BATCH_SIZE, villas.length)})... `
    );

    // Traiter le batch en parallèle
    const results = await Promise.allSettled(
      batch.map(async (villa) => {
        const arabic = await translateToArabic(villa.description_fr, villa.ref);

        if (DRY_RUN) {
          return { id: villa.id, ref: villa.ref, preview: arabic.substring(0, 80) };
        }

        const { error: updateError } = await supabase
          .from('villas')
          .update({ description_ar: arabic })
          .eq('id', villa.id);

        if (updateError) {
          throw new Error(`Supabase update: ${updateError.message}`);
        }

        return { id: villa.id, ref: villa.ref };
      })
    );

    // Comptabiliser les résultats
    let batchSuccess = 0;
    let batchFailed  = 0;

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const villa = batch[j];
      
      if (result.status === 'fulfilled') {
        batchSuccess++;
        success++;
        if (DRY_RUN && result.value.preview) {
          console.log(`\n   [${result.value.ref}] Preview: ${result.value.preview}...`);
        } else if (!DRY_RUN) {
          console.log(`\n   [${villa.ref}] ✅ Traduit et sauvegardé`);
        }
      } else {
        batchFailed++;
        failed++;
        errors.push({ 
          ref: villa.ref, 
          error: result.reason?.message || 'Erreur inconnue' 
        });
        console.log(`\n   [${villa.ref}] ❌ Erreur: ${result.reason?.message || 'Erreur inconnue'}`);
      }
    }

    console.log(` ✅ ${batchSuccess} ok${batchFailed > 0 ? ` | ❌ ${batchFailed} erreurs` : ''}`);

    // Pause entre les batches pour éviter le rate limit OpenAI
    if (i + BATCH_SIZE < villas.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 3. Rapport final
  console.log(`
╔══════════════════════════════════════════════╗
║                   Résultat                   ║
╚══════════════════════════════════════════════╝
  ✅ Succès  : ${success}
  ❌ Erreurs : ${failed}
  Total     : ${villas.length}
  ${DRY_RUN ? '\n  ⚠️  DRY RUN — aucune donnée écrite en base' : ''}
`);

  if (errors.length > 0) {
    console.log('❌ Détail des erreurs :');
    errors.forEach(e => console.log(`   [${e.ref}] ${e.error}`));
  }

  if (!DRY_RUN && success > 0) {
    console.log(`💾 ${success} traduction(s) arabe sauvegardée(s) dans Supabase.\n`);
  }
}

main().catch(err => {
  console.error('\n💥 Erreur fatale :', err.message);
  process.exit(1);
});
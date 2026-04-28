// TODO — Stripe : remplacer cet endpoint par :
// POST /api/stripe/checkout avec { priceId, agencyId, agencyEmail }
// qui retourne { url } → redirect vers Stripe Checkout
// Les price IDs Stripe seront définis dans src/lib/modules.ts

const RESEND_KEY = process.env.RESEND_KEY || '';

export async function POST(req: Request) {
  const { moduleName, modulePrice, agencyName, agencyEmail } = await req.json();

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'DATAhome <noreply@data-home.app>',
      to: 'gm.harchies@gmail.com',
      subject: `🔓 Demande activation — ${moduleName} — ${agencyName}`,
      html: `
        <h2>Demande d'activation de module</h2>
        <p><strong>Agence :</strong> ${agencyName}</p>
        <p><strong>Email :</strong> ${agencyEmail}</p>
        <p><strong>Module demandé :</strong> ${moduleName}</p>
        <p><strong>Prix :</strong> ${modulePrice} €/mois</p>
        <hr/>
        <p>Connectez-vous à l'AgencyDashboard pour activer ce module.</p>
      `,
    }),
  });

  return Response.json({ success: true });
}

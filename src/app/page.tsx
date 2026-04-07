// src/app/page.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * RACINE DU SAAS (Server Component)
 * Correction : Ajout de 'await' pour les headers (Requis par Next.js 15+)
 */
export default async function RootPage() {
  // On attend la résolution des headers avant d'utiliser .get()
  const headerList = await headers(); 
  const host = headerList.get("host") || "";

  // Logique de redirection ultra-rapide côté serveur
  // Cela évite l'écran blanc sur WhatsApp/Starlink
  redirect('/fr/schmidt-privilege'); 
}
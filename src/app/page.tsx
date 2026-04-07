// app/page.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * RACINE DU SAAS (Server Component)
 * Cette page est lue par le serveur Vercel AVANT d'envoyer quoi que ce soit au téléphone.
 */
export default async function RootPage() {
  const headerList = headers();
  const host = headerList.get("host") || "";

  // LOGIQUE SAAS : 
  // Ici, tu peux détecter si l'utilisateur arrive via un sous-domaine 
  // ou une URL spécifique. 
  
  // Pour l'instant, pour éviter l'écran blanc de Gillian :
  // Si l'utilisateur arrive sur la racine brute (datahome.vercel.app),
  // on le redirige vers l'agence de démo ou une page de sélection.
  
  // Cette redirection se fait en 1ms au niveau du serveur.
  // WhatsApp ne verra jamais de page blanche car il reçoit l'ordre de bouger immédiatement.
  redirect('/fr/schmidt-privilege'); 
}
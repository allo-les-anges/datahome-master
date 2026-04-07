// app/page.tsx
import { redirect } from "next/navigation";

/**
 * Cette page est la "tour de contrôle" racine. 
 * Elle ne contient pas d'UI car elle redirige instantanément 
 * vers la page de l'agence pour éviter les bugs de chargement sur mobile.
 */
export default function RootPage() {
  redirect('/fr/schmidt-privilege');
}
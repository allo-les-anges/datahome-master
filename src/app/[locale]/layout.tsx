import { Inter, Montserrat, Playfair_Display, Poppins, Roboto_Mono } from "next/font/google";
import "@/app/globals.css";
import { ReactNode } from "react";
import { notFound } from "next/navigation";

// Configuration des polices
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const poppins = Poppins({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-poppins" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto" });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>; // Correction : params est une Promise
}) {
  // On attend la résolution des paramètres
  const { locale } = await params;

  // Vérification des langues supportées
  const supportedLocales = ['fr', 'en', 'es', 'nl', 'ar', 'pl']; // J'ai ajouté les langues vues dans votre dashboard
  if (!supportedLocales.includes(locale)) {
    notFound();
  }

  return (
    <html lang={locale} className="scroll-smooth">
      <body suppressHydrationWarning={true}
        className={`
          ${inter.variable} 
          ${montserrat.variable} 
          ${playfair.variable} 
          ${poppins.variable} 
          ${robotoMono.variable} 
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}
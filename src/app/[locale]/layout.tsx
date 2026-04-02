import { Inter, Montserrat, Playfair_Display, Poppins, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { notFound } from "next/navigation";

// Configuration des polices pour correspondre à vos options du Dashboard
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const poppins = Poppins({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-poppins" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto" });

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  
  // Vérification sommaire des langues supportées
  const supportedLocales = ['fr', 'en', 'es'];
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
        {/* On peut ici injecter un Provider pour les traductions si nécessaire */}
        {children}
      </body>
    </html>
  );
}
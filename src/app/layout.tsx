import type { Metadata } from "next";
import { Inter, Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/contexts/I18nContext";
import { AgencyProvider } from "@/contexts/AgencyContext"; // <--- Importation
import Providers from "@/components/Providers";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: 'swap' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: 'swap' });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["100", "200", "300", "400"], display: 'swap' });

export const metadata: Metadata = {
  title: "DATA-HOME — Votre agence immobilière intelligente",
  description: "Solution immobilière intelligente",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const finalLocale = (resolvedParams.locale || savedLocale || "fr") as any;

  return (
    <html lang={finalLocale} suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${montserrat.variable} font-sans antialiased`}>
        <Providers>
          <AgencyProvider>
            <I18nProvider initialLocale={finalLocale}>
              <div className="min-h-screen flex flex-col">
                <main className="relative flex-grow">
                  {children}
                </main>
              </div>
            </I18nProvider>
          </AgencyProvider>
        </Providers>
      </body>
    </html>
  );
}
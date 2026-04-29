// src/app/onboarding/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Home - Onboarding Premium",
  description: "Configurez votre espace Data Home Premium",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
import AgencyPageClient from "@/app/AgencyPageClient";
export default function DynamicAgencyPage({ params }: { params: { slug: string } }) {
  // Next.js récupère automatiquement "amaru-homes" depuis l'URL
  const slug = params.slug;

  return <AgencyPageClient slug={slug} />;
}

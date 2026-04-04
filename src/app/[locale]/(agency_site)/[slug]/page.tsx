import AgencyPageClient from "@/app/AgencyPageClient";

export default async function DynamicAgencyPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // On attend la résolution des paramètres (Obligatoire sur Next.js 15+)
  const { slug } = await params;

  return <AgencyPageClient slug={slug} />;
}

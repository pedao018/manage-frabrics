import { notFound } from "next/navigation";
import { demoManageFrabricsFeatures, demoManageFrabricsSlugs } from "@/config/demo-manage-frabrics";
import FabricsMasterDataDemoPage from "./fabrics-master-data-demo-page";

export function generateStaticParams() {
  return demoManageFrabricsFeatures.map(({ slug }) => ({ feature: slug }));
}

export default async function DemoManageFrabricsFeaturePage({
  params,
}: {
  params: Promise<{ feature: string }>;
}) {
  const { feature: slug } = await params;
  const feature = demoManageFrabricsFeatures.find((item) => item.slug === slug);

  if (!feature) {
    notFound();
  }

  if (slug === demoManageFrabricsSlugs.fabricsMasterData) {
    return <FabricsMasterDataDemoPage title={feature.title} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-neutral-900">
      <h1 className="text-4xl font-semibold">{feature.title}</h1>
    </main>
  );
}

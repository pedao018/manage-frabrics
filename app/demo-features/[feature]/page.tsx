import { notFound } from "next/navigation";
import { demoFeatureSlugs, demoFeatures } from "@/config/demo-features";
import JsonCacheDemo from "./json-cache-demo-page";
import QrScanDemo from "./qr-scan-demo-page";
import CaptureMediaDemo from "./capture-media-demo-page";
import VoiceRecordingDemo from "./voice-recording-demo-page";
import SpeechToTextDemo from "./speech-to-text";

export function generateStaticParams() {
  return demoFeatures.map(({ slug }) => ({ feature: slug }));
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ feature: string }>;
}) {
  const { feature: slug } = await params;
  const feature = demoFeatures.find((item) => item.slug === slug);

  if (!feature) {
    notFound();
  }

  if (slug === demoFeatureSlugs.inputTextJsonCache) {
    return <JsonCacheDemo title={feature.title} />;
  }

  if (slug === demoFeatureSlugs.qrScanLocalImage) {
    return <QrScanDemo title={feature.title} />;
  }

  if (slug === demoFeatureSlugs.captureRecordingPictureVideo) {
    return <CaptureMediaDemo title={feature.title} />;
  }

  if (slug === demoFeatureSlugs.recordingLocalStorage) {
    return <VoiceRecordingDemo title={feature.title} />;
  }

  if (slug === demoFeatureSlugs.speechToText) {
    return <SpeechToTextDemo title={feature.title} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-neutral-900">
      <h1 className="text-4xl font-semibold">{feature.title}</h1>
    </main>
  );
}

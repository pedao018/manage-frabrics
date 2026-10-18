import Link from "next/link";

export const demoFeatures = [
  {
    slug: "input-text-json-cache",
    title: "Input text -> JSON Cache. Read cache",
  },
  {
    slug: "save-read-json-server",
    title: "Input text -> Save and Read JSON from Server",
  },
  {
    slug: "qr-scan-local-image",
    title: "QR Scan. Read QR image from file local",
  },
  {
    slug: "capture-recording-picture-video",
    title: "Capture. Recording. Open picture, open video",
  },
  {
    slug: "recording-local-storage",
    title: "Recording. Save and Read from local",
  },
] as const;

export default function DemoFeaturesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 py-12 text-neutral-900">
      <h1 className="text-4xl font-semibold">Demo Features</h1>
      <ul className="flex w-full max-w-xl flex-col gap-3">
        {demoFeatures.map((feature) => (
          <li key={feature.slug}>
            <Link
              className="block rounded-md border border-neutral-300 px-5 py-4 text-left transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              href={`/demo-features/${feature.slug}`}
            >
              {feature.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

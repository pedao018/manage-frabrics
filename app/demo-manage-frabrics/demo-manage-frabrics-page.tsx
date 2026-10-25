import Link from "next/link";
import { demoManageFrabricsFeatures } from "@/config/demo-manage-frabrics";

export default function DemoManageFrabricsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 py-12 text-neutral-900">
      <h1 className="text-4xl font-semibold">Demo Manage Frabrics</h1>
      <ul className="flex w-full max-w-xl flex-col gap-3">
        {demoManageFrabricsFeatures.map((feature) => (
          <li key={feature.slug}>
            <Link
              className="block rounded-md border border-neutral-300 px-5 py-4 text-left transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              href={`/demo-manage-frabrics/${feature.slug}`}
            >
              {feature.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center text-neutral-900">
      <h1 className="text-4xl font-semibold">Frabics App</h1>
      <p className="text-lg">Hello, my name is KeiKa.</p>
      <a
        className="rounded-md bg-neutral-900 px-5 py-3 font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        href="https://www.youtube.com"
      >
        Press Here
      </a>
      <Link
        className="rounded-md border border-neutral-300 px-5 py-3 font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        href="/demo-features"
      >
        Demo Features
      </Link>
      <Link
        className="rounded-md border border-neutral-300 px-5 py-3 font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        href="/demo-manage-frabrics"
      >
        Demo Manage Frabrics
      </Link>
    </main>
  );
}

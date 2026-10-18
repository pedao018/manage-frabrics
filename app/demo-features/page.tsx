import type { Metadata } from "next";
import DemoFeaturesPage from "./demo-features-page";

export const metadata: Metadata = {
  title: "Demo Features",
};

export default function Page() {
  return <DemoFeaturesPage />;
}

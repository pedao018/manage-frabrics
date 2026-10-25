import type { Metadata } from "next";
import DemoManageFrabricsPage from "./demo-manage-frabrics-page";

export const metadata: Metadata = {
  title: "Demo Manage Frabrics",
};

export default function Page() {
  return <DemoManageFrabricsPage />;
}

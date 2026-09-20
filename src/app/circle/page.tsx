import type { Metadata } from "next";
import AskMyCircle from "@/components/AskMyCircle";
import RequireProfile from "@/components/RequireProfile";

export const metadata: Metadata = { title: "Ask My Circle — DocCircle" };

export default function CirclePage() {
  return (
    <RequireProfile feature="Ask My Circle">
      <AskMyCircle />
    </RequireProfile>
  );
}

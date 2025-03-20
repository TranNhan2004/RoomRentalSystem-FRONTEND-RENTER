import { SaveForLaterList } from "@/components/main/save-for-later/SaveForLaterList";
import { Metadata } from "next";
                                  
export const metadata: Metadata = {
  title: "List of save for later",
  description: "List of save for later page.",
};
                                  
export default function SaveForLaterListPage() {
  return (
    <>
      <SaveForLaterList />
    </>
  );
};
import { MonthlyRoomInvoicesList } from "@/components/main/rental-room/monthly-room-invoice/MonthlyRoomInvoicesList";
import { Metadata } from "next";
                                  
export const metadata: Metadata = {
  title: "List of monthly room invoices",
  description: "List of monthly room invoices page.",
};
                                  
export default async function MonthlyRoomInvoicesListPage({
  params,
}: {
  params: Promise<{
    monitoringRentalId: string;
  }>,
}) {
  const { monitoringRentalId } = await params;

  return (
    <>
      <MonthlyRoomInvoicesList monitoringRentalId={monitoringRentalId} />
    </>
  );
};
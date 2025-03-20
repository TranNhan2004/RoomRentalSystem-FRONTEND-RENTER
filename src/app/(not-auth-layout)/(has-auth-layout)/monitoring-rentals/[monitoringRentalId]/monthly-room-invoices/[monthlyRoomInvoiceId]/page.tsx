import { MonthlyRoomInvoiceDetails } from "@/components/main/rental-room/monthly-room-invoice/MonthlyRoomInvoiceDetails";
import { Metadata } from "next";
                                  
export const metadata: Metadata = {
  title: "Details of the monthly room invoice",
  description: "Details of the monthly room invoice page.",
};
                                  
export default async function MonthlyRoomInvoiceDetailsPage({
  params,
}: {
  params: Promise<{
    monitoringRentalId: string;
    monthlyRoomInvoiceId: string;
  }>,
}) {
  const { monitoringRentalId, monthlyRoomInvoiceId } = await params;

  return (
    <>
      <MonthlyRoomInvoiceDetails 
        monitoringRentalId={monitoringRentalId} 
        id={monthlyRoomInvoiceId} 
      />
    </>
  );
};
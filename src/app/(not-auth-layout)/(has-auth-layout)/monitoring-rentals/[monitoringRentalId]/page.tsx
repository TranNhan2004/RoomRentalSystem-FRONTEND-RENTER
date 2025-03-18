import { Metadata } from "next";
                                  
export const metadata: Metadata = {
  title: "Details of the monitoring rental",
  description: "Details of the monitoring rental",
};
                                  
export default async function MonitoringRentalDetailsPage({
  params,
}: {
  params: Promise<{
    monitoringRentalId: string;
  }>
}) {
  const { monitoringRentalId } = await params;

  return (
    <>
      <h1>Monitoring Rental Details</h1>
      <p>Monitoring Rental ID: {monitoringRentalId}</p>
    </>
  );
};
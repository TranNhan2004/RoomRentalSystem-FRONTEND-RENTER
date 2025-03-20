import { MonitoringRentalsList } from "@/components/main/rental-room/monitoring-rental/MonitoringRentalsList";
import { Metadata } from "next";
                                  
export const metadata: Metadata = {
  title: "List of monitoring rentals",
  description: "List of monitoring rentals page.",
};
                                  
export default function MonitoringRentalsListPage() {
  return (
    <>
      <MonitoringRentalsList />
    </>
  );
};
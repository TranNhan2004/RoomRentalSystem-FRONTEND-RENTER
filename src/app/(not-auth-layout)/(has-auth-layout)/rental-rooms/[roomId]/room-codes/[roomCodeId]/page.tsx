import { RoomCodeDetails } from "@/components/main/rental-room/room-code/RoomCodeDetails";
import { Metadata } from "next";
                                  
export const metadata: Metadata = {
  title: "Details of the room code",
  description: "Details of the room code page.",
};
                                  
export default async function RoomCodeDetailsPage({
  params,
}: {
  params: Promise<{
    roomId: string;
    roomCodeId: string;
  }>
}) {
  const { roomId, roomCodeId } = await params;

  return (
    <>
      <RoomCodeDetails roomId={roomId} id={roomCodeId} />
    </>
  );
};
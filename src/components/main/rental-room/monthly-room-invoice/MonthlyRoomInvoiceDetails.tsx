"use client";

import React, { useEffect, useState } from "react";
import {
  INITIAL_CHARGES,
  INITIAL_MONTHLY_ROOM_INVOICE,
  INITIAL_RENTAL_ROOM,
  INITIAL_ROOM_CODE,
} from "@/initials/RentalRoom.initial";
import {
  ChargesType,
  MonthlyRoomInvoiceType,
  RentalRoomType,
  RoomCodeType,
} from "@/types/RentalRoom.type";
import { useRouter } from "next/navigation";
import { NOT_FOUND_URL } from "@/lib/client/notFoundURL";
import { Loading } from "@/components/partial/data/Loading";
import { formatCurrency, formatDate } from "@/lib/client/format";
import { ActionButton } from "@/components/partial/button/ActionButton";
import {
  chargesService,
  monitoringRentalService,
  monthlyRoomInvoiceService,
  rentalRoomService,
  roomCodeService,
} from "@/services/RentalRoom.service";

type MonthlyRoomInvoiceDetailsProps = {
  monitoringRentalId: string;
  id: string;
};

export const MonthlyRoomInvoiceDetails = (
  props: MonthlyRoomInvoiceDetailsProps
) => {
  const router = useRouter();
  const [data, setData] = useState<MonthlyRoomInvoiceType>(
    INITIAL_MONTHLY_ROOM_INVOICE
  );
  const [chargesData, setChargesData] = useState<ChargesType>(INITIAL_CHARGES);
  const [roomData, setRoomData] = useState<RentalRoomType>(INITIAL_RENTAL_ROOM);
  const [roomCodeData, setRoomCodeData] =
    useState<RoomCodeType>(INITIAL_ROOM_CODE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [data, monitoringRentalData] = await Promise.all([
          monthlyRoomInvoiceService.get(props.id),
          monitoringRentalService.get(props.monitoringRentalId),
        ]);

        const roomCodeData = await roomCodeService.get(
          monitoringRentalData.room_code ?? ""
        );

        const [roomData, chargesData] = await Promise.all([
          rentalRoomService.get(roomCodeData.rental_room ?? ""),
          chargesService.getMany({
            rental_room: roomCodeData.rental_room,
            first_only: true,
          }),
        ]);

        setData(data);
        setRoomData(roomData);
        setChargesData(chargesData[0]);
        setRoomCodeData(roomCodeData);
      } catch {
        router.push(NOT_FOUND_URL);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [props, router]);

  const cancelOnClick = async () => {
    router.push(
      `/monitoring-rentals/${props.monitoringRentalId}/monthly-room-invoices`
    );
  };

  if (loading) {
    return <Loading />;
  }

  const roomCost = chargesData.room_charge ?? 0;
  const electricityUsage =
    (data.new_kWh_reading ?? 0) - (data.old_kWh_reading ?? 0);
  const waterUsage = (data.new_m3_reading ?? 0) - (data.old_m3_reading ?? 0);
  const electricityCost =
    electricityUsage * (chargesData.electricity_charge ?? 0);
  const waterCost = waterUsage * (chargesData.water_charge ?? 0);
  const wifiCost = chargesData.wifi_charge ?? 0;
  const rubbishCost = chargesData.rubbish_charge ?? 0;
  const prevDebt = data.prev_remaining_charge ?? 0;
  const totalDue = data.due_charge ?? 0;
  const paid = data.paid_charge ?? 0;
  const remainingPaid = Math.max(totalDue - paid, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold uppercase">Hóa đơn tiền trọ</h1>
        <p className="text-sm text-gray-600">ID: {data.id}</p>
      </div>

      <div className="mb-6">
        <p>
          <strong>Tên phòng trọ:</strong> {roomData.name || "N/A"}
        </p>
        <p>
          <strong>Mã phòng:</strong> {roomCodeData.value || "N/A"}
        </p>
        <p>
          <strong>Ngày tạo:</strong> {formatDate(data.created_at, "dmy")}
        </p>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">STT</th>
            <th className="border p-2 text-left">Loại phí</th>
            <th className="border p-2 text-left">Chỉ số cũ</th>
            <th className="border p-2 text-left">Chỉ số mới</th>
            <th className="border p-2 text-left">Giá tiền/đơn vị</th>
            <th className="border p-2 text-left">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">1</td>
            <td className="border p-2">Tiền phòng</td>
            <td className="border p-2">-</td>
            <td className="border p-2">-</td>
            <td className="border p-2">
              {data.continue_renting
                ? `${formatCurrency(chargesData.room_charge)}/tháng`
                : "-"}
            </td>
            <td className="border p-2">
              {data.continue_renting ? formatCurrency(roomCost) : "-"}
            </td>
          </tr>
          <tr>
            <td className="border p-2">2</td>
            <td className="border p-2">Tiền điện</td>
            <td className="border p-2">{data.old_kWh_reading ?? "N/A"}</td>
            <td className="border p-2">{data.new_kWh_reading ?? "N/A"}</td>
            <td className="border p-2">
              {formatCurrency(chargesData.electricity_charge)}/kWh
            </td>
            <td className="border p-2">{formatCurrency(electricityCost)}</td>
          </tr>
          <tr>
            <td className="border p-2">3</td>
            <td className="border p-2">Tiền nước</td>
            <td className="border p-2">{data.old_m3_reading ?? "N/A"}</td>
            <td className="border p-2">{data.new_m3_reading ?? "N/A"}</td>
            <td className="border p-2">
              {formatCurrency(chargesData.water_charge)}/m<sup>3</sup>
            </td>
            <td className="border p-2">{formatCurrency(waterCost)}</td>
          </tr>
          <tr>
            <td className="border p-2">4</td>
            <td className="border p-2">Tiền wifi</td>
            <td className="border p-2">-</td>
            <td className="border p-2">-</td>
            <td className="border p-2">
              {chargesData.wifi_charge !== -1
                ? `${formatCurrency(chargesData.wifi_charge)}/tháng`
                : "-"}
            </td>
            <td className="border p-2">
              {wifiCost !== -1 ? formatCurrency(wifiCost) : "-"}
            </td>
          </tr>
          <tr>
            <td className="border p-2">5</td>
            <td className="border p-2">Tiền thu dọn rác</td>
            <td className="border p-2">-</td>
            <td className="border p-2">-</td>
            <td className="border p-2">
              {formatCurrency(chargesData.rubbish_charge)}/tháng
            </td>
            <td className="border p-2">{formatCurrency(rubbishCost)}</td>
          </tr>
          <tr>
            <td className="border p-2">6</td>
            <td className="border p-2">Tiền nợ tháng trước</td>
            <td className="border p-2">-</td>
            <td className="border p-2">-</td>
            <td className="border p-2">-</td>
            <td className="border p-2">{formatCurrency(prevDebt)}</td>
          </tr>
          <tr>
            <td className="border p-2 italic font-bold" colSpan={5}>
              Tổng số tiền phải trả
            </td>
            <td className="border p-2 italic font-bold">
              {formatCurrency(totalDue)}
            </td>
          </tr>
          <tr>
            <td className="border p-2 italic font-bold" colSpan={5}>
              Tổng số tiền đã trả
            </td>
            <td className="border p-2 italic font-bold">
              {formatCurrency(paid)}
            </td>
          </tr>
          <tr>
            <td className="border p-2 italic font-bold" colSpan={5}>
              Số tiền còn lại phải trả
            </td>
            <td className="border p-2 italic font-bold">
              {formatCurrency(remainingPaid)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mb-6">
        <p>
          <strong>Ngày cập nhật:</strong> {formatDate(data.updated_at, "dmy")}
        </p>
        <p>
          <strong>Trạng thái:</strong>{" "}
          {data.is_settled ? "Đã kết toán" : "Chưa kết toán"}
        </p>
      </div>

      <div className="w-full h-[60px] rounded-lg bg-gray-200">
        <div className="flex justify-end items-center h-full mr-4">
          <ActionButton mode="cancel" onClick={cancelOnClick}>
            Thoát
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

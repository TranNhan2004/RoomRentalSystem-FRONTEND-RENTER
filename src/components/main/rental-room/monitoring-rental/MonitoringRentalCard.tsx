'use client';

import React, { useEffect, useState } from 'react';
import { ActionButton } from '@/components/partial/button/ActionButton';
import { DataLine } from '@/components/partial/data/DataLine';
import { formatDate } from '@/lib/client/format';
import { MonitoringRentalType } from '@/types/RentalRoom.type';


type MonitoringRentalCardProps = {
  ordinal: number;
  item: MonitoringRentalType;
  shareRoomCodeFunction: (id: string) => void;
  stopShareRoomCodeFunction: (id: string) => void;
  redirectFunction: (id: string) => void;
}

export const MonitoringRentalCard = (props: MonitoringRentalCardProps) => {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(Boolean(
      !props.item._room_code_obj?.is_shared &&
      props.item._room_code_obj?.current_occupancy && props.item._room_code_obj?.max_occupancy &&
      props.item._room_code_obj.current_occupancy < props.item._room_code_obj.max_occupancy
    ));
  }, [props.item._room_code_obj]);

  const shareRoomCodeClick = () => {
    props.shareRoomCodeFunction(props.item.room_code ?? '');
    setCanShare(!canShare);
  };

  const stopShareRoomCodeClick = () => {
    props.stopShareRoomCodeFunction(props.item.room_code ?? '');
    setCanShare(!canShare);
  };

  const redirectToMonthlyRoomInvoicesListClick = () => {
    props.redirectFunction(props.item.id ?? '');
  };

  return (
    <div className='w-[550px] h-56 border border-gray-400 flex flex-col items-center rounded-lg overflow-hidden shadow-md'>
      <div className={`w-full bg-blue-300 text-white text-center py-2 text-lg font-semibold`}>
        {props.ordinal}
      </div>
      <div className='flex-1 w-full bg-white ml-6 mt-4'>
        <DataLine label='Tên trọ' value={props.item._room_name} />
        <DataLine label='Mã phòng' value={props.item._room_code_obj?.value} />
        <DataLine label='Ngày bắt đầu thuê' value={formatDate(props.item.start_date, 'dmy')} />
        <DataLine 
          label='Ngày kết thúc thuê' 
          value={props.item.end_date ? formatDate(props.item.end_date, 'dmy') : 'Chưa xác định'} 
        />
      </div>

      <div className='flex justify-end ml-auto mr-4 space-x-4 mb-3'>
        {
          canShare ? (
            <ActionButton mode='share' onClick={shareRoomCodeClick} >
              Chia sẻ phòng
            </ActionButton>
          ) : props.item._room_code_obj?.current_occupancy && props.item._room_code_obj?.max_occupancy &&
          props.item._room_code_obj.current_occupancy < props.item._room_code_obj.max_occupancy ? (
            <ActionButton mode='stopShare' onClick={stopShareRoomCodeClick} >
              Dừng chia sẻ
            </ActionButton>
          ) : null
        }
        <ActionButton mode='redirect' onClick={redirectToMonthlyRoomInvoicesListClick}>
          DS hóa đơn tiền trọ
        </ActionButton>
      </div>
    </div>
  );
};
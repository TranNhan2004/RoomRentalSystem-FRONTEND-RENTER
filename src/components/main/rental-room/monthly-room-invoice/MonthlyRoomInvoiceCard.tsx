'use client';

import React from 'react';
import { ActionButton } from '@/components/partial/button/ActionButton';
import { DataLine } from '@/components/partial/data/DataLine';
import { formatCurrency, formatDate } from '@/lib/client/format';
import { MonthlyRoomInvoiceType } from '@/types/RentalRoom.type';


type MonthlyRoomInvoiceCardProps = {
  ordinal: number;
  item: MonthlyRoomInvoiceType;
  redirectFunction: (id: string) => void;
}

export const MonthlyRoomInvoiceCard = (props: MonthlyRoomInvoiceCardProps) => {
  const redirectToDetailsClick = () => {
    props.redirectFunction(props.item.id ?? '');
  };

  return (
    <div className='w-[550px] h-56 border border-gray-400 flex flex-col items-center rounded-lg overflow-hidden shadow-md'>
      <div className={`w-full bg-blue-300 text-white text-center py-2 text-lg font-semibold`}>
        {props.ordinal}
      </div>
      <div className='flex-1 w-full bg-white ml-6 mt-4'>
        <DataLine label='Số tiền phải trả' value={formatCurrency(props.item.due_charge)} />
        <DataLine label='Số tiền đã trả' value={formatCurrency(props.item.paid_charge)} />
        <DataLine label='Ngày tạo' value={formatDate(props.item.created_at, 'dmy')} />
        <DataLine 
          label='Trạng thái' 
          value={props.item.is_settled ? 'Đã kết toán' : 'Chưa kết toán'} 
        />
      </div>

      <div className='flex justify-end ml-auto mr-4 space-x-4 mb-3'>
        <ActionButton mode='redirect' onClick={redirectToDetailsClick}>
          Chi tiết
        </ActionButton>
      </div>
    </div>
  );
};
'use client';

import { DataLine } from '@/components/partial/data/DataLine';
import { RoomCodeType } from '@/types/RentalRoom.type';
import React from 'react';

type RoomCodeCardProps = {
  item: RoomCodeType;
}

export const RoomCodeCard = (props: RoomCodeCardProps) => {
  const bgClass = props.item.current_occupancy === 0 ? 'bg-mygreen' : 
                  props.item.is_shared ? 'bg-yellow-500' : 'bg-gray-500';

  return (
    <div className='w-40 h-32 border border-gray-400 flex flex-col items-center rounded-lg overflow-hidden shadow-md'>
      <div className={`w-full ${bgClass} text-white text-center py-2 text-lg font-semibold`}>
        {props.item.value}
      </div>
      <div className='flex-1 w-full bg-white ml-4 mt-4'>
        <DataLine label='Số người ở tối đa' value={props.item.max_occupancy} />
        <DataLine label='Số người ở hiện tại' value={props.item.current_occupancy} />
      </div>
    </div>
  );
};

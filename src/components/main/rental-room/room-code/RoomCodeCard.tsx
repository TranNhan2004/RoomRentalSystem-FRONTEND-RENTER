'use client';

import { DataLine } from '@/components/partial/data/DataLine';
import { RoomCodeType } from '@/types/RentalRoom.type';
import React from 'react';

type RoomCodeCardProps = {
  value: RoomCodeType['value'];
  currentOccupancy: RoomCodeType['current_occupancy'];
  maxOccupancy: RoomCodeType['max_occupancy'];
  isShared: RoomCodeType['is_shared'];
}

export const RoomCodeCard = (props: RoomCodeCardProps) => {
  const bgClass = props.currentOccupancy === 0 ? 'bg-mygreen' : 
                  props.isShared ? 'bg-yellow-500' : 'bg-gray-500'

  return (
    <div className='w-40 h-32 border border-gray-400 flex flex-col items-center rounded-lg overflow-hidden shadow-md'>
      <div className={`w-full ${bgClass} text-white text-center py-2 text-lg font-semibold`}>
        {props.value}
      </div>
      <div className='flex-1 w-full bg-white ml-4 mt-4'>
        <DataLine label='Số người ở tối đa' value={props.maxOccupancy} />
        <DataLine label='Số người ở hiện tại' value={props.currentOccupancy} />
      </div>
    </div>
  );
};

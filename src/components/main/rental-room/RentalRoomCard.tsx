'use client';

import React from 'react';
import Image from 'next/image';
import { RentalRoomType } from '@/types/RentalRoom.type';
import { RatingStar } from '@/components/partial/data/RatingStar';
import { ActionButton } from '@/components/partial/button/ActionButton';
import { getImageSrc } from '@/lib/client/getImageSrc';
import { formatCurrency, round } from '@/lib/client/format';

type RentalRoomCardProps = {
  item: RentalRoomType;
  detailsFunction?: (id: string) => void;
};

export const RentalRoomCard = (props: RentalRoomCardProps) => {
  return (
    <div className="border rounded-lg shadow-lg overflow-hidden w-64 bg-gray-50">
      <div className="w-64 h-48 relative">
        <Image
          src={props.item._image as string || getImageSrc('not-found.png')}
          alt={`Image of ${props.item.name}`}
          width={560}
          height={480}
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>

      <div className="relative top-3 bottom-5 right-5 bg-gradient-to-r from-blue-500 to-green-500 text-white text-[16px] font-medium px-3 py-1 rounded-full shadow-md">
        <p className='text-left ml-7'>
          Khoảng cách: {round(props.item._distance_value, 1)} km
        </p>
      </div>

      <div className="p-4 mt-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{props.item.name}</h2>

        <div className="text-lg font-semibold text-gray-800 mb-3">
          {formatCurrency(props.item._room_charge)}
        </div>

        <div className="flex items-center mb-5">
          <RatingStar value={props.item.average_rating ?? 0} />
          <span className="ml-2 text-gray-600 text-sm">
            {`${round(props.item.average_rating, 1)}/5`}
          </span>
        </div>
        
        <div className='flex items-center space-x-2 justify-end'>
          <ActionButton 
            mode='details' 
            onClick={() => props.detailsFunction?.(props.item.id ?? '')}
          >
            Chi tiết
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

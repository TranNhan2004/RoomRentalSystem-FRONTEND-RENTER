'use client';

import React from 'react';
import Image from 'next/image';
import { RentalRoomType, RoomImageType, ChargesType } from '@/types/RentalRoom.type';
import { RatingStar } from '@/components/partial/data/RatingStar';
import { ActionButton } from '@/components/partial/button/ActionButton';
import { getImageSrc } from '@/lib/client/getImageSrc';
import { formatCurrency } from '@/lib/client/format';

type RentalRoomCardProps = {
  id: RentalRoomType['id'];
  name: RentalRoomType['name'];
  manager: RentalRoomType['manager'];
  averageRating: RentalRoomType['average_rating'];
  image?: RoomImageType['image'];
  roomCharge?: ChargesType['room_charge'];
  detailsFunction?: (id: string) => void;
};

export const RentalRoomCard = (props: RentalRoomCardProps) => {
  return (
    <div className="border rounded-lg shadow-lg overflow-hidden w-64 bg-gray-50">
      <div className="w-64 h-48">
        <Image
          src={props.image as string || getImageSrc('not-found.png')}
          alt={`Image of ${props.name}`}
          width={560}
          height={480}
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{props.name}</h2>

        <div className="text-lg font-semibold text-gray-800 mb-3">
          {formatCurrency(props.roomCharge)}
        </div>

        <div className="flex items-center mb-5">
          <RatingStar value={props.averageRating ?? 0} />
          <span className="ml-2 text-gray-600 text-sm">
            {`${props.averageRating}/5`}
          </span>
        </div>
        
        <div className='flex items-center space-x-2 justify-end'>
          <ActionButton 
            mode='details' 
            onClick={() => props.detailsFunction?.(props.id ?? '')}
          >
            Chi tiết
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { RoomImageType } from '@/types/RentalRoom.type';
import { roomImageService } from '@/services/RentalRoom.service';
import { toastError } from '@/lib/client/alert';
import { RoomImageMessage } from '@/messages/RentalRoom.message';

type RoomImagesListProps = {
  roomId: string;
}

export const RoomImagesList = (props: RoomImagesListProps) => {
  const [data, setData] = useState<RoomImageType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [thumbnailOffset, setThumbnailOffset] = useState(0); 
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await roomImageService.getMany({ rental_room: props.roomId });
        setData(data);
    
      } catch {
        await toastError(RoomImageMessage.GET_MANY_ERROR);
      }
    };

    fetchData();
  }, [props.roomId]);

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      if (currentIndex - 1 < thumbnailOffset) {
        setThumbnailOffset((prevOffset) => prevOffset - 1);
      }
    }
  };

  const nextImage = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      if (currentIndex + 1 >= thumbnailOffset + 3) {
        setThumbnailOffset((prevOffset) => prevOffset + 1);
      }
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    if (index < thumbnailOffset) {
      setThumbnailOffset(index);
    } else if (index >= thumbnailOffset + 3) {
      setThumbnailOffset(index - 2);
    }
  };

  return (
    <>
      <div className='max-w-lg mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg'>
        {
          data.length > 0 ? (
            <div className='relative'>
              <div className='flex justify-center items-center rounded-lg overflow-hidden'>
                <div className='w-64 h-96'>
                  <Image
                    src={data[currentIndex].image as string}
                    alt='Image Carousel'
                    width={640}
                    height={900}
                    className="object-cover w-full h-full rounded-sm"
                    unoptimized
                  />
                </div>
              </div>

              <div className='flex justify-center items-center mt-4 space-x-2'>
                <button onClick={prevImage} className='text-gray-600 p-2' disabled={currentIndex === 0}>
                  <ChevronLeftIcon className='h-6 w-6' />
                </button>
                {
                  data
                    .slice(thumbnailOffset, thumbnailOffset + 3)
                    .map((item, index) => {
                      const globalIndex = thumbnailOffset + index;
                      return (
                        <div
                          key={globalIndex}
                          className={`relative w-20 h-20 bg-gray-200 rounded-lg overflow-hidden cursor-pointer ${
                            currentIndex === globalIndex ? 'border-2 border-blue-500' : ''
                          }`}
                          onClick={() => handleThumbnailClick(globalIndex)}
                        >
                          <Image
                            src={item.image as string}
                            alt={`Thumbnail ${globalIndex + 1}`}
                            className='w-full h-full object-cover'
                            width={80}
                            height={80}
                            unoptimized
                          />
                        </div>
                      );
                    })
                }
                <button onClick={nextImage} className='text-gray-600 p-2' disabled={currentIndex === data.length - 1}>
                  <ChevronRightIcon className='h-6 w-6' />
                </button>
              </div>
            </div>
          ) : (
            <p className='text-center text-gray-600'>Chưa có ảnh nào được tải lên</p>
          )
        }
      </div>
    </>
  );
};
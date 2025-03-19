'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Title } from '@/components/partial/data/Title';
import { InputSearch } from '@/components/partial/data/InputSearch';
import { Sorting } from '@/components/partial/data/Sorting';
import { roomCodeService } from '@/services/RentalRoom.service';
import { RoomCodeType } from '@/types/RentalRoom.type';
import { RoomCodeMessage } from '@/messages/RentalRoom.message';
import { RoomCodeCard } from './RoomCodeCard';
import { PaginationNav } from '@/components/partial/data/PaginationNav';
import { Loading } from '@/components/partial/data/Loading';
import { toastError } from '@/lib/client/alert';

type RoomCodesListProps = {
  roomId: string;
}

export const RoomCodesList = (props: RoomCodesListProps) => {
  const originalDataRef = useRef<RoomCodeType[]>([]);
  const [data, setData] = useState<RoomCodeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const cardsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await roomCodeService.getMany({ rental_room: props.roomId });
        originalDataRef.current = data;
        setData(data);
      
      } catch {
        await toastError(RoomCodeMessage.GET_MANY_ERROR);
      
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [props.roomId]);

  const onPageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <Title>Danh sách các mã phòng</Title>
      <div className='flex items-center'>
        <div className='w-[40%]'>
          <InputSearch 
            placeholder='Tìm kiếm theo mã phòng'
            options={['value']}
            originalData={originalDataRef.current}
            data={data}
            setData={setData}
          />
        </div>

        <div className='ml-[30px]'>
          <Sorting
            options={[
              { label: 'Mã phòng (A-Z)', value: 'asc-value' },
              { label: 'Mã phòng (Z-A)', value: 'desc-value' },
            ]}
            originalData={originalDataRef.current}
            data={data}
            setData={setData}
          />
        </div>
      </div>

      {
        loading ? (
          <Loading textSize={12} />
        ) : (
          <>  
            <div className='mt-8 flex items-center space-x-6'>
              <p><b>Trong đó:</b></p>
              <div className='flex items-center'>
                <span className='block w-4 h-4 bg-mygreen rounded-sm'></span>
                <p>&nbsp; - Phòng trống hoàn toàn</p>
              </div>
              <div className='flex items-center'>
                <span className='block w-4 h-4 bg-yellow-500 rounded-sm'></span>
                <p>&nbsp; - Phòng có thể ở ghép</p>
              </div>
              <div className='flex items-center'>
                <span className='block w-4 h-4 bg-gray-500 rounded-sm'></span>
                <p>&nbsp; - Phòng không trống hoặc không thể ở ghép</p>
              </div>
            </div>
            <div className='grid grid-cols-4 gap-4 mt-5 mb-8'>
              {
                data.length === 0 
                  ? 'Không có dữ liệu' 
                  : data.map((item, index) => (
                    <RoomCodeCard
                      key={index}
                      value={item.value}
                      maxOccupancy={item.max_occupancy}
                      currentOccupancy={item.current_occupancy}
                      isShared={item.is_shared}
                    />
                  )) 
              }
            </div>
            <PaginationNav
              totalPages={Math.ceil(data.length / cardsPerPage)}
              currentPage={currentPage}
              onPageChange={onPageChange}
              step={6}
            />
          </>
        )
      }
    </div>
  );
};
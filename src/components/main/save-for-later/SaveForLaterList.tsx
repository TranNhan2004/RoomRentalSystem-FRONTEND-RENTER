'use client';
                          
import React, { useEffect, useRef, useState } from 'react';
import { SaveForLaterCard } from './SaveForLaterCard';
import { SaveForLaterType } from '@/types/SaveForLater.type';
import { saveForLaterService } from '@/services/SaveForLater.service';
import { SaveForLaterMessage } from '@/messages/SaveForLater.message';
import { toastError, toastSuccess } from '@/lib/client/alert';
import { Sorting } from '@/components/partial/data/Sorting';
import { Loading } from '@/components/partial/data/Loading';
import { PaginationNav } from '@/components/partial/data/PaginationNav';
import { rentalRoomService } from '@/services/RentalRoom.service';
import { getMyInfo } from '@/lib/client/authToken';
import { useRouter } from 'next/navigation';

export const SaveForLaterList = () => {
  const router = useRouter();
  const originalDataRef = useRef<SaveForLaterType[]>([]);
  const myIdRef = useRef<string | undefined>(undefined);
  const [data, setData] = useState<SaveForLaterType[]>([]);
  const [displayedData, setDisplayedData] = useState<SaveForLaterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const cardsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        myIdRef.current = (await getMyInfo()).id;

        const data = await saveForLaterService.getMany({ renter: myIdRef.current });
        const roomData = await Promise.all(data.map(item => rentalRoomService.get(item.rental_room ?? '')));
        const fullData = data.map(item => ({
          ...item,
          _room_name: roomData.find(roomItem => item.rental_room === roomItem.id)?.name,
        }));

        originalDataRef.current = fullData;
        setData(fullData);
      
      } catch {
        await toastError(SaveForLaterMessage.GET_MANY_ERROR);
      
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setDisplayedData([...data.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage)]);
  }, [data, currentPage]);

  const onPageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  const deleteFunction = async (id: string) => {
    try {
      await saveForLaterService.delete(id);
      await toastSuccess(SaveForLaterMessage.DELETE_SUCCESS);
      originalDataRef.current = originalDataRef.current.filter(item => item.id !== id);
      setData([...originalDataRef.current]);
      
    } catch {
      await toastError(SaveForLaterMessage.DELETE_ERROR);
    }
  };

  const redirectFunction = (id: string) => {
    router.push(`/rental-rooms/${id}`);
  };

  if (loading) {
    return <Loading />;
  }
  
  return (
    <div>
      <div className='flex items-center'>
        <Sorting
          options={[
            { label: 'Mới nhất', value: 'desc-created_at' },
            { label: 'Cũ nhất', value: 'asc-created_at' },
          ]}
          originalData={originalDataRef.current}
          data={data}
          setData={setData}
        />
      </div>

      <div className='grid grid-cols-2 gap-4 mt-8 mb-8'>
        {
          displayedData.length === 0 
            ? 'Không có dữ liệu' 
            : displayedData.map((item, index) => (
              <SaveForLaterCard
                key={item.id}
                ordinal={index + 1}
                item={item}
                deleteFunction={deleteFunction}
                redirectFunction={redirectFunction}
              />
            )) 
        }
      </div>
      <div className='flex justify-end text-sm italic text-gray-500 mr-2'>
        <p>Tổng cộng {data.length} bản ghi</p>
      </div>
      <PaginationNav
        totalPages={Math.ceil(data.length / cardsPerPage)}
        currentPage={currentPage}
        onPageChange={onPageChange}
        step={6}
      />
    </div>
  );
};
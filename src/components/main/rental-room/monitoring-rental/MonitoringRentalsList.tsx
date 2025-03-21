'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toastError, toastSuccess } from '@/lib/client/alert';
import { useRouter } from 'next/navigation';
import { Sorting } from '@/components/partial/data/Sorting';
import { MonitoringRentalQueryType, MonitoringRentalType } from '@/types/RentalRoom.type';
import { monitoringRentalService, rentalRoomService, roomCodeService } from '@/services/RentalRoom.service';
import { MonitoringRentalMessage, RoomCodeMessage } from '@/messages/RentalRoom.message';
import { PaginationNav } from '@/components/partial/data/PaginationNav';
import { MonitoringRentalCard } from './MonitoringRentalCard';
import { Loading } from '@/components/partial/data/Loading';
import { getMyInfo } from '@/lib/client/authToken';
import { INITIAL_MONITORING_RENTAL_QUERY } from '@/initials/RentalRoom.initial';
import { Validators } from '@/types/Validators.type';
import { handleInputChange } from '@/lib/client/handleInputChange';
import { FilterModal } from '@/components/partial/data/FilterModal';
import { Label } from '@/components/partial/form/Label';
import { Input } from '@/components/partial/form/Input';
import { formatDate } from '@/lib/client/format';

              
export const MonitoringRentalsList = () => {
  const router = useRouter();

  const myIdRef = useRef<string | undefined>(undefined);
  const [data, setData] = useState<MonitoringRentalType[]>([]);
  const [query, setQuery] = useState<MonitoringRentalQueryType>(INITIAL_MONITORING_RENTAL_QUERY);
  const [displayedData, setDisplayedData] = useState<MonitoringRentalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
    
  const cardsPerPage = 20;
  
  const originalDataRef = useRef<MonitoringRentalType[]>([]);

  const fetchRelatedData = useCallback(async (data: MonitoringRentalType[]) => {
    const roomCodeData = await Promise.all(data.map(
      item => roomCodeService.get(item.room_code ?? '')
    ));

    const rentalRoomData = await Promise.all(roomCodeData.map(
      item => rentalRoomService.get(item.rental_room ?? '')
    ));

    return data.map((item, index) => ({
     ...item,
      _room_code_obj: roomCodeData[index],
      _room_name: rentalRoomData[index].name
    }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        myIdRef.current = (await getMyInfo()).id;

        const data = await monitoringRentalService.getMany({ renter: myIdRef.current });
        originalDataRef.current = await fetchRelatedData(data);
        
        setData([...originalDataRef.current]);

      } catch {
        await toastError(MonitoringRentalMessage.GET_MANY_ERROR);
    
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchRelatedData]);

  useEffect(() => {
    setDisplayedData([...data.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage)]);
  }, [data, currentPage]);

  const filterOnClick = async () => {
    try {
      setLoading(true);
      const data = await monitoringRentalService.getMany({
        ...query, 
        renter: myIdRef.current,
        from_date: formatDate(query.from_date as Date, 'ymd'),
        to_date: formatDate(query.to_date as Date, 'ymd'),
      });

      originalDataRef.current = await fetchRelatedData(data);
      setData([...originalDataRef.current]);
      
    } catch {
      await toastError(MonitoringRentalMessage.GET_MANY_ERROR);
    
    } finally {
      setLoading(false);
    }
  };

  const refreshOnClick = () => {
    setQuery(INITIAL_MONITORING_RENTAL_QUERY);
  };

  const dateValidators: Validators<MonitoringRentalQueryType> = {
    to_date: () => {
      if (query.from_date && query.to_date && query.to_date < query.from_date) {
        return MonitoringRentalMessage.END_DATE_INVALID;
      } 
      return null;
    }
  };

  const handleQueryInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e, setQuery);
  };

  const onPageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const redirectFunction = (id: string) => {
    router.push(`/monitoring-rentals/${id}/monthly-room-invoices/`);
  };

  const shareRoomCodeFunction = async (roomCodeId: string) => {
    try {
      await roomCodeService.patch(roomCodeId, { is_shared: true });
      await toastSuccess(RoomCodeMessage.SHARE_SUCCESS);
      originalDataRef.current = originalDataRef.current.map(item => {
        if (item._room_code_obj?.id === roomCodeId) {
          return { ...item, _room_code_obj: { ...item._room_code_obj, is_shared: true } };
        }

        return item;
      });
      setData([...originalDataRef.current]);
    
    } catch {
      await toastError(RoomCodeMessage.SHARE_ERROR);
    }
  };

  const stopShareRoomCodeFunction = async (roomCodeId: string) => {
    try {
      await roomCodeService.patch(roomCodeId, { is_shared: false });
      await toastSuccess(RoomCodeMessage.STOP_SHARE_SUCCESS);
      originalDataRef.current = originalDataRef.current.map(item => {
        if (item._room_code_obj?.id === roomCodeId) {
          return { ...item, _room_code_obj: { ...item._room_code_obj, is_shared: false } };
        }

        return item;
      });
      setData([...originalDataRef.current]);
    
    } catch {
      await toastError(RoomCodeMessage.STOP_SHARE_ERROR);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className='flex items-center'>
        <div>
          <Sorting
            options={[
              { label: 'Mới nhất', value: 'desc-start_date' },
              { label: 'Cũ nhất', value: 'asc-start_date' },
            ]}
            originalData={originalDataRef.current}
            data={data}
            setData={setData}
          />
        </div>

        <div className='ml-[10px]'>
          <FilterModal 
            filterOnClick={filterOnClick}
            refreshOnClick={refreshOnClick}
          >
            <div className='grid grid-cols-2 items-center mt-1 mb-1'>
              <Label htmlFor='from-date-query'>Từ ngày: </Label>
              <Input
                id='from-date-query'
                name='from_date'
                type='date'
                value={formatDate(query.from_date as Date, 'ymd')}
                className='ml-[-200px] w-[300px]'
                onChange={handleQueryInputOnChange}
              />
            </div>  

            <div className='grid grid-cols-2 items-center mt-1 mb-1'>
              <Label htmlFor='to-date-query'>Đến ngày: </Label>
              <Input
                id='to-date-query'
                name='to_date'
                type='date'
                value={formatDate(query.to_date as Date, 'ymd')}
                className='ml-[-200px] w-[300px]'
                onChange={handleQueryInputOnChange}
                validate={dateValidators.to_date}
              />
            </div>    
          </FilterModal>
        </div>
      </div>
      
      <div className='grid grid-cols-2 gap-4 mt-8 mb-8'>
        {
          displayedData.length === 0 
            ? 'Không có dữ liệu' 
            : displayedData.map((item, index) => (
              <MonitoringRentalCard
                key={item.id}
                ordinal={index + 1}
                item={item}
                shareRoomCodeFunction={shareRoomCodeFunction}
                stopShareRoomCodeFunction={stopShareRoomCodeFunction}
                redirectFunction={redirectFunction}
              />
            )) 
        }
      </div>
      <div className='flex justify-end text-sm italic text-gray-500 mr-5 mt-5'>
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
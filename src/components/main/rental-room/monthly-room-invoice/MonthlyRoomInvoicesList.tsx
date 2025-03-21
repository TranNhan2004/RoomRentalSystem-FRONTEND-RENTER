'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sorting } from '@/components/partial/data/Sorting';
import { FilterModal } from '@/components/partial/data/FilterModal';
import { Label } from '@/components/partial/form/Label';
import { MonitoringRentalType, MonthlyRoomInvoiceQueryType, MonthlyRoomInvoiceType } from '@/types/RentalRoom.type';
import { INITIAL_MONITORING_RENTAL, INITIAL_MONTHLY_ROOM_INVOICE_QUERY } from '@/initials/RentalRoom.initial';
import { monitoringRentalService, monthlyRoomInvoiceService } from '@/services/RentalRoom.service';
import { MonthlyRoomInvoiceMessage } from '@/messages/RentalRoom.message';
import { handleInputChange } from '@/lib/client/handleInputChange';
import { Input } from '@/components/partial/form/Input';
import { Validators } from '@/types/Validators.type';
import { formatDate } from '@/lib/client/format';
import { Select } from '@/components/partial/form/Select';
import { Loading } from '@/components/partial/data/Loading';
import { MonthlyRoomInvoiceCard } from './MonthlyRoomInvoiceCard';
import { PaginationNav } from '@/components/partial/data/PaginationNav';
import { toastError } from '@/lib/client/alert';
import { maxStr, minStr } from '@/lib/client/stringLimit';

                          
type MonthlyRoomInvoicesListProps = {
  monitoringRentalId: string;
}

export const MonthlyRoomInvoicesList = (props: MonthlyRoomInvoicesListProps) => {
  const router = useRouter();
  
  const [data, setData] = useState<MonthlyRoomInvoiceType[]>([]);
  const [displayedData, setDisplayedData] = useState<MonthlyRoomInvoiceType[]>([]);
  const [query, setQuery] = useState<MonthlyRoomInvoiceQueryType>(INITIAL_MONTHLY_ROOM_INVOICE_QUERY);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const originalDataRef = useRef<MonthlyRoomInvoiceType[]>([]);
  const monitoringRentalDataRef = useRef<MonitoringRentalType>(INITIAL_MONITORING_RENTAL);

  const cardsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const monitoringRentalData = await monitoringRentalService.get(props.monitoringRentalId);
        const data = await monthlyRoomInvoiceService.getMany({
          room_code: monitoringRentalData.room_code,
          from_created_date: formatDate(monitoringRentalData.start_date as Date, 'ymd'),
          to_created_date: monitoringRentalData.end_date ? 
                            formatDate(monitoringRentalData.end_date as Date, 'ymd') :
                            undefined
        });
      
        monitoringRentalDataRef.current = monitoringRentalData;
        originalDataRef.current = data;
        setData([...originalDataRef.current]);

      } catch {
        await toastError(MonthlyRoomInvoiceMessage.GET_MANY_ERROR);
    
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [props.monitoringRentalId]);

  useEffect(() => {
    setDisplayedData([...data.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage)]);
  }, [data, currentPage]);

  const onPageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const filterOnClick = async () => {
    try {
      setLoading(true);
      const data = await monthlyRoomInvoiceService.getMany({
        ...query, 
        room_code: monitoringRentalDataRef.current.room_code,
        from_created_date: minStr(
          formatDate(monitoringRentalDataRef.current.start_date, 'ymd'),
          formatDate(query.to_created_date as Date, 'ymd')
        ),
        to_created_date: monitoringRentalDataRef.current.end_date ? maxStr(
          formatDate(monitoringRentalDataRef.current.end_date, 'ymd'),
          formatDate(query.from_created_date as Date, 'ymd')
        ) : formatDate(query.from_created_date as Date, 'ymd')
      });

      originalDataRef.current = data;
      setData(data);
      
    } catch {
      await toastError(MonthlyRoomInvoiceMessage.GET_MANY_ERROR);
    
    } finally {
      setLoading(false);
    }
  };

  const refreshOnClick = () => {
    setQuery(INITIAL_MONTHLY_ROOM_INVOICE_QUERY);
  };

  const dateValidators: Validators<MonthlyRoomInvoiceQueryType> = {
    to_created_date: () => {
      if (query.from_created_date && query.to_created_date && query.to_created_date < query.from_created_date) {
        return MonthlyRoomInvoiceMessage.END_DATE_INVALID;
      } 
      return null;
    }
  };

  const handleQueryInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e, setQuery);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'true') {
      setQuery({...query, is_settled: true });
    
    } else if (value === 'false') {
      setQuery({...query, is_settled: false });
    
    } else {
      setQuery({...query, is_settled: undefined });
    }
  };

  const redirectFunction = (id: string) => {
    router.push(`monthly-room-invoices/${id}`);
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
              { label: 'Mới nhất', value: 'desc-created_at' },
              { label: 'Cũ nhất', value: 'asc-created_at' },
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
              <Label htmlFor='from-created-date-query'>Từ ngày: </Label>
              <Input
                id='from-created-date-query'
                name='from_created_date'
                type='date'
                value={formatDate(query.from_created_date as Date, 'ymd')}
                className='ml-[-200px] w-[300px]'
                onChange={handleQueryInputOnChange}
              />
            </div>  

            <div className='grid grid-cols-2 items-center mt-1 mb-1'>
              <Label htmlFor='to-created-date-query'>Đến ngày: </Label>
              <Input
                id='to-created-date-query'
                name='to_created_date'
                type='date'
                value={formatDate(query.to_created_date as Date, 'ymd')}
                className='ml-[-200px] w-[300px]'
                onChange={handleQueryInputOnChange}
                validate={dateValidators.to_created_date}
              />
            </div>  

            <div className='grid grid-cols-2 items-center mt-1 mb-1'>
              <Label htmlFor='status-query'>Trạng thái: </Label>
              <Select
                id='status-query'
                value={query.is_settled === undefined ?
                  '' : query.is_settled ?
                  'true' : 'false'
                }
                className='ml-[-200px] w-[300px]'
                options={[
                  { label: 'Đã kết toán', value: 'true' },
                  { label: 'Chưa kết toán', value: 'false' },
                ]}
                onChange={handleStatusChange}
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
              <MonthlyRoomInvoiceCard
                key={item.id}
                ordinal={index + 1}
                item={item}
                redirectFunction={redirectFunction}
              />
            )) 
        }
      </div>
      <div className='flex justify-end text-sm italic text-gray-500 mr-2'>
        <p>Tổng cộng {data.length} hóa đơn</p>
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
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toastError } from '@/lib/client/alert';
import { useRouter } from 'next/navigation';
import { InputSearch } from '@/components/partial/data/InputSearch';
import { Sorting } from '@/components/partial/data/Sorting';
import { FilterModal } from '@/components/partial/data/FilterModal';
import { Label } from '@/components/partial/form/Label';
import { OptionType, Select } from '@/components/partial/form/Select';
import { RentalRoomQueryType, RentalRoomType } from '@/types/RentalRoom.type';
import { INITIAL_RENTAL_ROOM_QUERY } from '@/initials/RentalRoom.initial';
import { rentalRoomService } from '@/services/RentalRoom.service';
import { RentalRoomMessage } from '@/messages/RentalRoom.message';
import { communeService, districtService, provinceService } from '@/services/Address.service';
import { mapOptions } from '@/lib/client/handleOptions';
import { CommuneType, DistrictType } from '@/types/Address.type';
import { Loading } from '@/components/partial/data/Loading';
import { RentalRoomCard } from './RentalRoomCard';
import { GeneralMessage } from '@/messages/General.message';
import { PaginationNav } from '@/components/partial/data/PaginationNav';
import { Taskbar } from '@/components/partial/data/Taskbar';
import { getMyInfo } from '@/lib/client/authToken';
import { setSearchToLocalStorage } from '@/services/SearchRoomHistory.service';
import { 
  getRecommendationFromLocalStorage, 
  setRecommendationToLocalStorage,
  recommendationService
} from '@/services/Recommendation.service';


export const RentalRoomsList = () => {
  const router = useRouter();
  const originalDataRef = useRef<RentalRoomType[]>([]);

  const [data, setData] = useState<RentalRoomType[]>([]);
  const [displayedData, setDisplayedData] = useState<RentalRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<RentalRoomQueryType>(INITIAL_RENTAL_ROOM_QUERY); 
  const [provinceOptions, setProvinceOptions] = useState<OptionType[]>([]);
  const [districtOptions, setDistrictOptions] = useState<OptionType[]>([]);
  const [communeOptions, setCommuneOptions] = useState<OptionType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('all');

  const myIdRef = useRef<string | undefined>(undefined);
  const originalDistrictDataRef = useRef<DistrictType[]>([]);
  const originalCommuneDataRef = useRef<CommuneType[]>([]);
  
  const cardsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        myIdRef.current = (await getMyInfo()).id;

        const [data, provinceData, districtData, communeData] = await Promise.all([
          rentalRoomService.getMany({ manager_is_null: false, _renter: myIdRef.current }),
          provinceService.getMany(),
          districtService.getMany(),
          communeService.getMany(),
        ]);

        originalDataRef.current = [...data];
        
        setData([...originalDataRef.current]);
        setProvinceOptions(mapOptions(provinceData, ['name'], 'id'));
        setDistrictOptions(mapOptions(districtData, ['name'], 'id'));
        setCommuneOptions(mapOptions(communeData, ['name'], 'id'));

        originalDistrictDataRef.current = districtData;
        originalCommuneDataRef.current = communeData;
    
      } catch {
        await toastError(RentalRoomMessage.GET_MANY_ERROR);
      
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setDisplayedData([...data.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage)]);
  }, [data, currentPage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (viewMode === 'all') {
          const data = await rentalRoomService.getMany({ manager_is_null: false });
          originalDataRef.current = [...data];
          setData([...originalDataRef.current]);
          
        } else if (viewMode === 'recommend') {
          let recommendationList = await getRecommendationFromLocalStorage();
          if (recommendationList.length === 0) {
            recommendationList = await recommendationService.getMany({ renter: myIdRef.current });
            await setRecommendationToLocalStorage(recommendationList);
          }

          const data = await rentalRoomService.listByIds({ _recommendation_list: recommendationList });
          originalDataRef.current = [...data];
          setData([...originalDataRef.current]);
        
        } else {
          await toastError(GeneralMessage.UNKNOWN_ERROR);
          return;
        }
      } catch {

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewMode]);

  const onPageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const detailsFunction = useCallback(async (id: string) => {
    router.push(`rental-rooms/${id}`);
    await setSearchToLocalStorage(id, myIdRef.current ?? '');
  }, [router]);

  const filterOnClick = async () => {
    try {
      setLoading(true);
      if (query._province !== '' && query._district === '' && query.commune === '') {
        const districts = await districtService.getMany({ province: query._province });
        
        const communesArray = await Promise.all(districts.map(
          district => communeService.getMany({ district: district.id })
        ));
        const communes = communesArray.flat();
        
        const dataArray = await Promise.all(communes.map(
          commune => rentalRoomService.getMany({ ...query, commune: commune.id, manager_is_null: false })
        ));

        const data = dataArray.flat();
        originalDataRef.current = [...data];
        setData([...originalDataRef.current]);

      } else if (query._district !== '' && query.commune === '') {
        const communes = await communeService.getMany({ district: query._district });
        const dataArray = await Promise.all(communes.map(
          commune => rentalRoomService.getMany({ ...query, commune: commune.id, manager_is_null: false })
        ));
        const data = dataArray.flat();
        originalDataRef.current = [...data];
        setData([...originalDataRef.current]);

      } else {
        const data = await rentalRoomService.getMany({ ...query, manager_is_null: false });
        originalDataRef.current = [...data];
        setData([...originalDataRef.current]);
      }
      
    } catch {
      await toastError(RentalRoomMessage.GET_MANY_ERROR);

    } finally {
      setLoading(false);
    }
  };

  const refreshOnClick = () => {
    setQuery(INITIAL_RENTAL_ROOM_QUERY);
  };

  const handleProvinceQueryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuery({ ...query, _province: e.target.value });
    if (e.target.value === '') {
      setDistrictOptions(mapOptions(originalDistrictDataRef.current, ['name'], 'id'));
    } else {
      const districts = originalDistrictDataRef.current.filter(district => district.province === e.target.value);
      setDistrictOptions(mapOptions(districts, ['name'], 'id'));
    }
  };

  const handleDistrictQueryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuery({ ...query, _district: e.target.value });
    if (e.target.value === '') {
      setCommuneOptions(mapOptions(originalCommuneDataRef.current, ['name'], 'id'));
    } else {
      const communes = originalCommuneDataRef.current.filter(commune => commune.district === e.target.value);
      setCommuneOptions(mapOptions(communes, ['name'], 'id'));
    }
  };

  const handleCommuneQueryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuery({ ...query, commune: e.target.value });
  };

  const handleRoomChargeQueryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuery({ ...query, _room_charge_range: e.target.value });
  };

  const handleEmptyModeQueryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuery({ ...query, _empty_mode: e.target.value });
  };

  const handleViewModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewMode(e.target.value);
  };


  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <Taskbar>
        <div className='w-[45%]'>
          <InputSearch 
            placeholder='Tìm kiếm theo tên phòng trọ'
            options={['name']}
            originalData={originalDataRef.current}
            data={data}
            setData={setData}
          />
        </div>

        <div className='ml-[5px]'>
          <Sorting
            options={[
              { label: 'Tên phòng trọ (A-Z)', value: 'asc-name' },
              { label: 'Tên phòng trọ (Z-A)', value: 'desc-name' },
              { label: 'Số sao tăng dần', value: 'asc-average_rating' },
              { label: 'Số sao giảm dần', value: 'desc-average_rating' },
              { label: 'Khoảng cách tăng dần', value: 'asc-_distance_value'},
              { label: 'Khoảng cách giảm dần', value: 'desc-_distance_value'},
              { label: 'Giá phòng tăng dần', value: 'asc-_room_charge'},
              { label: 'Giá phòng giảm dần', value: 'desc-_room_charge'},
              { label: 'Mới nhất', value: 'desc-created_at' },
              { label: 'Cũ nhất', value: 'asc-created_at' },
            ]}
            originalData={originalDataRef.current}
            data={data}
            setData={setData}
          />
        </div>

        <div className='ml-[70px] flex items-center space-x-4'>
          <Label htmlFor='view-mode'><p className='font-semibold'>Chế độ xem:</p></Label>
          <Select
            id='view-mode'
            options={[
              { label: 'Tất cả', value: 'all' },
              { label: 'Gợi ý', value: 'recommend' },
            ]}
            value={viewMode}
            onChange={handleViewModeChange}
            notUseEmptyValue
          />
        </div>

        <div className='flex ml-auto {}'>
          <FilterModal
            filterOnClick={filterOnClick}
            refreshOnClick={refreshOnClick}
            disabled={viewMode === 'recommend'}
          >
            <div className='grid grid-cols-2 items-center mt-1 mb-1'>
              <Label htmlFor='province-query'>Tỉnh/Thành phố: </Label>
              <Select
                id='province-query'
                value={query._province}
                className='ml-[-200px] w-[300px]'
                options={provinceOptions}
                onChange={handleProvinceQueryChange}
              />
            </div>    

            <div className='grid grid-cols-2 items-center mt-1 mb-1'>
              <Label htmlFor='district-query'>Huyện/Quận/Thị xã: </Label>
              <Select
                id='district-query'
                value={query._district}
                className='ml-[-200px] w-[300px]'
                options={districtOptions}
                onChange={handleDistrictQueryChange}
              />
            </div> 

            <div className='grid grid-cols-2 items-center mt-1 mb-1'>
              <Label htmlFor='commune-query'>Xã/Phường/Thị trấn: </Label>
              <Select
                id='commune-query'
                value={query.commune}
                className='ml-[-200px] w-[300px]'
                options={communeOptions}
                onChange={handleCommuneQueryChange}
              />
            </div> 

            <div className='grid grid-cols-2 items-center mt-1 mb-1'>
              <Label htmlFor='-empty-mode-query'>Trạng thái: </Label>
              <Select
                id='-empty-mode-query'
                className='ml-[-200px] w-[300px]'
                value={query._empty_mode}
                options={[
                  { label: 'Phòng trống hoàn toàn', value: 'complete' },
                  { label: 'Phòng có thể ở ghép', value: 'shared' },
                  { label: 'Phòng không trống', value: 'unavailable' },
                ]}
                onChange={handleEmptyModeQueryChange}
              />
            </div>

            <div className='grid grid-cols-2 items-center mt-1 mb-1'>
              <Label htmlFor='-room-charge-query'>Giá phòng: </Label>
              <Select
                id='-room-charge-query'
                className='ml-[-200px] w-[300px]'
                value={query._room_charge_range}
                options={[
                  { label: 'Từ 1 triệu trở xuống', value: '0-1' },
                  { label: 'Từ 1 triệu đến 1,2 triệu', value: '1-1.2' },
                  { label: 'Từ 1,2 triệu đến 1,5 triệu', value: '1.2-1.5' },
                  { label: 'Từ 1,5 triệu đến 1,7 triệu', value: '1.5-1.7' },
                  { label: 'Từ 1,7 triệu đến 2 triệu', value: '1.7-2' },
                  { label: 'Từ 2 triệu đến 2,5 triệu', value: '2-2.5' },
                  { label: 'Từ 2,5 triệu đến 3 triệu', value: '2.5-3' },
                  { label: 'Từ 3 triệu trở lên', value: '3-inf' },
                ]}
                onChange={handleRoomChargeQueryChange}
              />
            </div>   
          </FilterModal>
        </div>
      </Taskbar>
      
      <div className='min-h-screen flex flex-col'>
        <div className='flex-grow mt-12'>
          <div className='grid grid-cols-4 gap-4'>
            {
              displayedData.length === 0 
              ? 'Không có dữ liệu' 
              : displayedData.map((item) => (
                <RentalRoomCard
                  key={item.id}
                  item={item}
                  detailsFunction={detailsFunction}
                />
              ))
            }
          </div>
        </div>
        <div className='flex justify-end text-sm italic text-gray-500 mr-5 mt-5'>
          <p>Tổng cộng {data.length} phòng trọ</p>
        </div>
        <PaginationNav 
          totalPages={Math.ceil(data.length / cardsPerPage)}
          currentPage={currentPage}
          onPageChange={onPageChange}
          step={6}
        />
      </div>
    </div>
  );
};
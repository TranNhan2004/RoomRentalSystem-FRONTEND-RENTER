'use client';
                          
import React, { useEffect, useState } from 'react';
import { RoomImagesList } from './image/RoomImagesList';
import { DataLine } from '@/components/partial/data/DataLine';
import { ChargesType, RentalRoomType } from '@/types/RentalRoom.type';
import { INITIAL_CHARGES, INITIAL_RENTAL_ROOM } from '@/initials/RentalRoom.initial';
import { CommuneType, DistrictType, ProvinceType } from '@/types/Address.type';
import { INITIAL_COMMUNE, INITIAL_DISTRICT, INITIAL_PROVINCE } from '@/initials/Address.initial';
import { chargesService, rentalRoomService } from '@/services/RentalRoom.service';
import { communeService, districtService, provinceService } from '@/services/Address.service';
import { useRouter } from 'next/navigation';
import { NOT_FOUND_URL } from '@/lib/client/notFoundURL';
import { RoomCodesList } from './room-code/RoomCodesList';
import { ReviewsList } from '../review/ReviewsList';
import { ActionButton } from '@/components/partial/button/ActionButton';
import { Loading } from '@/components/partial/data/Loading';
import { formatCurrency } from '@/lib/client/format';
import { RatingStar } from '@/components/partial/data/RatingStar';
import { DataDetails } from '@/components/partial/data/DataDetails';

type RentalRoomDetailsProps = {
  id: string;
}
                          
export const RentalRoomDetails = (props: RentalRoomDetailsProps) => {
  const router = useRouter();
  const [data, setData] = useState<RentalRoomType>(INITIAL_RENTAL_ROOM);
  const [chargesData, setChargesData] = useState<ChargesType>(INITIAL_CHARGES);
  const [provinceData, setProvinceData] = useState<ProvinceType>(INITIAL_PROVINCE);
  const [districtData, setDistrictData] = useState<DistrictType>(INITIAL_DISTRICT);
  const [communeData, setCommuneData] = useState<CommuneType>(INITIAL_COMMUNE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await rentalRoomService.get(props.id);
        const chargesData = (await chargesService.getMany({ rental_room: props.id, first_only: true }))[0];
        const communeData = await communeService.get(data.commune ?? '');
        const districtData = await districtService.get(communeData.district ?? '');
        const provinceData = await provinceService.get(districtData.province?? '');
        
        setData(data);
        setChargesData(chargesData);
        setCommuneData(communeData);
        setDistrictData(districtData);
        setProvinceData(provinceData);
      
      } catch {
        router.push(NOT_FOUND_URL);

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [props.id, router]);

  const cancelOnClick = () => {
    router.push('/rental-rooms');
  };

  if (loading) {
    return <Loading />;
  }


  return (
    <>
      <div className='flex space-x-8 mt-[-5%]'>
        <div className='w-1/3'>
          <RoomImagesList roomId={props.id} />
        </div>

        <div className='w-2 bg-white-400 h-full'></div>

        <div className='w-2/3 flex items-start'>
          
          <div className='w-1/2'>
            <div className='p-4 mt-5'>
              <h2 className='text-2xl font-bold'>Chi tiết phòng trọ</h2>
              <div className='mt-4 ml-2 space-y-4'>
                <DataLine label='Tên' value={data.name} />
                <DataLine label='Thuộc tỉnh/thành phố' value={provinceData.name} />
                <DataLine label='Thuộc huyện/quận/thị xã' value={districtData.name} />
                <DataLine label='Thuộc xã/phường/thị trấn' value={communeData.name} />
                <DataLine label='Địa chỉ cụ thể' value={data.additional_address} />
                <DataLine label='Giờ đóng cửa' value={data.closing_time || 'Chưa xác định'} />
                <DataLine label='Tổng số phòng' value={data.total_number} />
                <div className='flex items-center'>
                  <DataLine label='Đánh giá trung bình' value={''} />   
                  <RatingStar value={data.average_rating ?? 0} />
                  <span className='ml-2 text-gray-800'>{data.average_rating}/5</span>
                </div>
                <DataLine label='Mô tả' value={data.further_description || 'Không có mô tả'} />
              </div>
            </div>
            <div className='mt-2 ml-5 flex items-center space-x-4'>
              <ActionButton mode='save'>
                Lưu vào mục Xem sau
              </ActionButton>
              <ActionButton mode='cancel' onClick={cancelOnClick}>
                Thoát
              </ActionButton>
            </div>
          </div>
      
          <div className='w-1/2'>
            <div className='p-4'>
              <DataDetails
                title={`Chi tiết các mức giá`}
                data={[
                  {
                    label: 'Giá phòng',
                    value: formatCurrency(chargesData.room_charge)
                  },
                  {
                    label: 'Giá đặt cọc',
                    value: formatCurrency(chargesData.deposit)
                  },
                  {
                    label: 'Giá điện',
                    value: formatCurrency(chargesData.electricity_charge)
                  },
                  {
                    label: 'Giá nước',
                    value: formatCurrency(chargesData.water_charge)
                  },
                  {
                    label: 'Giá wifi',
                    value: chargesData.wifi_charge === -1 ? 'Không cung cấp wifi' : formatCurrency(chargesData.wifi_charge)
                  },
                  {
                    label: 'Giá thu dọn rác',
                    value: formatCurrency(chargesData.rubbish_charge)
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='mt-16'>
        <RoomCodesList roomId={props.id} />
      </div>

      <div className='mt-16'>
        <ReviewsList roomId={props.id} />
      </div>
    </>
  );
};
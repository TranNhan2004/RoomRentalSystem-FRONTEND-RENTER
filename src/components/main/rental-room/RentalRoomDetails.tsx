'use client';
                          
import React, { useEffect, useRef, useState } from 'react';
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
import { formatCurrency, round } from '@/lib/client/format';
import { RatingStar } from '@/components/partial/data/RatingStar';
import { DataDetails } from '@/components/partial/data/DataDetails';
import { SaveForLaterType } from '@/types/SaveForLater.type';
import { INITIAL_SAVE_FOR_LATER } from '@/initials/SaveForLater.initial';
import { Input } from '@/components/partial/form/Input';
import { handleInputChange } from '@/lib/client/handleInputChange';
import { getMyInfo } from '@/lib/client/authToken';
import { saveForLaterService } from '@/services/SaveForLater.service';
import { handleCancelAlert, toastError, toastSuccess } from '@/lib/client/alert';
import { SaveForLaterMessage } from '@/messages/SaveForLater.message';
import { AxiosError } from 'axios';
import { DistanceType } from '@/types/Distance.type';
import { INITIAL_DISTANCE } from '@/initials/Distance.initial';
import { distanceService } from '@/services/Distance.service';

type RentalRoomDetailsProps = {
  id: string;
}
                          
export const RentalRoomDetails = (props: RentalRoomDetailsProps) => {
  const router = useRouter();
  const [data, setData] = useState<RentalRoomType>(INITIAL_RENTAL_ROOM);
  const [distanceData, setDistanceData] = useState<DistanceType>(INITIAL_DISTANCE);
  const [chargesData, setChargesData] = useState<ChargesType>(INITIAL_CHARGES);
  const [provinceData, setProvinceData] = useState<ProvinceType>(INITIAL_PROVINCE);
  const [districtData, setDistrictData] = useState<DistrictType>(INITIAL_DISTRICT);
  const [communeData, setCommuneData] = useState<CommuneType>(INITIAL_COMMUNE);
  const [saveForLaterData, setSaveForLaterData] = useState<SaveForLaterType>(INITIAL_SAVE_FOR_LATER);
  const [hasSaveForLaterData, setHasSaveForLaterData] = useState(false);
  const [isSaveForLaterMenuOpen, setIsSaveForLaterMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const myIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        myIdRef.current = (await getMyInfo()).id;

        const data = await rentalRoomService.get(props.id);
        const communeData = await communeService.get(data.commune ?? '');
        const districtData = await districtService.get(communeData.district ?? '');
        const provinceData = await provinceService.get(districtData.province?? '');
        
        const [chargesData, saveForLaterData, distanceData] = await Promise.all([
          chargesService.getMany({ rental_room: props.id, first_only: true }),
          saveForLaterService.getMany({ rental_room: props.id, renter: myIdRef.current }),
          distanceService.getMany({ rental_room: props.id, renter: myIdRef.current })
        ]);

        setData(data);
        setCommuneData(communeData);
        setDistrictData(districtData);
        setProvinceData(provinceData);
        
        if (chargesData.length > 0) {
          setChargesData(chargesData[0]);
        }
        
        if (saveForLaterData.length > 0) {
          setHasSaveForLaterData(true);
        }

        if (distanceData.length > 0) {
          setDistanceData(distanceData[0]);
        }
        
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

  const saveForLaterOnClick =  () => setIsSaveForLaterMenuOpen(!isSaveForLaterMenuOpen);

  const handlePostError = async (error: unknown) => {
    if (!(error instanceof AxiosError)) {
      setHasSaveForLaterData(false);
    
    } else if (
      error.response?.status === 400 &&
      error.response.data.non_field_errors[0] === SaveForLaterMessage.BACKEND_UNIQUE_FIELDS_ERROR
    ) {
      setHasSaveForLaterData(true);
    }
    
    await toastError(SaveForLaterMessage.POST_ERROR);
  };

  const saveForLaterSaveOnClick = async () => {
    try {
      await saveForLaterService.post({
        ...saveForLaterData,
        rental_room: props.id,
        renter: myIdRef.current,
      });

      setHasSaveForLaterData(true);
      await toastSuccess(SaveForLaterMessage.POST_SUCCESS);

    } catch (error) {
      await handlePostError(error);
    
    } finally {
      setIsSaveForLaterMenuOpen(false); 
    }
  };

  const saveForLaterCancelOnClick = async () => {
    await handleCancelAlert(() => {
      setSaveForLaterData(INITIAL_SAVE_FOR_LATER);
      setIsSaveForLaterMenuOpen(false);
    });
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
                  <span className='ml-2 text-gray-800'>{round(data.average_rating, 1)}/5</span>
                </div>
                <DataLine label='Mô tả' value={data.further_description || 'Không có mô tả'} />
                <DataLine 
                  label='Khoảng cách' 
                  value={`${round(distanceData.value, 1).toString().replace('.', ',')} km`} 
                />
              </div>
            </div>
            <div className='mt-2 ml-5 flex items-center space-x-4'>
              <ActionButton 
                mode='save' 
                onClick={saveForLaterOnClick}
                disabled={hasSaveForLaterData}
              >
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

      {
        isSaveForLaterMenuOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-lg w-[40%] h-[40%] relative flex flex-col'>
              <h2 className='text-xl font-semibold mb-4 flex justify-center items-center'>Thêm ghi chú</h2>

              <div className='flex-1 space-y-4'>
                <Input 
                  id='notes'
                  name='notes'
                  type='text'
                  placeholder='Ghi chú của bạn'
                  value={saveForLaterData.notes}
                  onChange={(e) => handleInputChange(e, setSaveForLaterData)}
                />
                <p className='text-sm text-gray-500 italic'>Có thể bỏ qua trường này</p>
              </div>

              <div className='flex items-center justify-center gap-4'>
                <ActionButton mode='save' onClick={saveForLaterSaveOnClick}>Lưu</ActionButton>
                <ActionButton mode='cancel' onClick={saveForLaterCancelOnClick}>Hủy</ActionButton>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};
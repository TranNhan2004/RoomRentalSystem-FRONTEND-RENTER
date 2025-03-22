'use client';

import React, { useEffect, useState } from 'react';
import { ActionButton } from '@/components/partial/button/ActionButton';
import { getMyInfo } from '@/lib/client/authToken';
import { displayGender, displayRole } from '@/lib/client/display';
import { UserType } from '@/types/UserAccount.type';
import { useRouter } from 'next/navigation';
import { DataLine } from '@/components/partial/data/DataLine';
import { DefaultAvatar } from '@/components/partial/account/DefaultAvatar';
import { formatDate } from '@/lib/client/format';
import { INITIAL_USER } from '@/initials/UserAccount.initial';
import { INITIAL_COMMUNE, INITIAL_DISTRICT, INITIAL_PROVINCE } from '@/initials/Address.initial';
import { CommuneType, DistrictType, ProvinceType } from '@/types/Address.type';
import { communeService, districtService, provinceService } from '@/services/Address.service';
import { toastError } from '@/lib/client/alert';
import { UserMessage } from '@/messages/UserAccount.message';
import { Loading } from '@/components/partial/data/Loading';


export const Profile = () => {
  const router = useRouter();
  const [myInfoData, setMyInfoData] = useState<UserType>(INITIAL_USER);
  const [loading, setLoading] = useState(false);
  const [provinceData, setProvinceData] = useState<ProvinceType>(INITIAL_PROVINCE);
  const [districtData, setDistrictData] = useState<DistrictType>(INITIAL_DISTRICT);
  const [communeData, setCommuneData] = useState<CommuneType>(INITIAL_COMMUNE);

  useEffect(() => {
    const setMyInfoDataFromCookie = async () => {
      try {
        setLoading(true);
        const myInfo = await getMyInfo();
        const communeData = await communeService.get(myInfo.workplace_commune ?? '');
        const districtData = await districtService.get(communeData.district ?? '');
        const provinceData = await provinceService.get(districtData.province ?? '');

        setMyInfoData(myInfo);
        setProvinceData(provinceData);
        setDistrictData(districtData);
        setCommuneData(communeData);
      
      } catch {
        await toastError(UserMessage.GET_ERROR);
      
      } finally {
        setLoading(false);
      } 
    };

    setMyInfoDataFromCookie();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className='p-6 w-full ml-[5%]'>
      <div className='grid grid-cols-3'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='relative'>
            <DefaultAvatar data={myInfoData} width={250} height={230} fontSize={100} shape='square' />
          </div>

          <div className='text-lef italic space-y-2'>
            <DataLine label='Ngày tạo tài khoản' value={formatDate(myInfoData.created_at, 'dmy')} />
            <DataLine label='Ngày cập nhật gần nhất' value={formatDate(myInfoData.updated_at, 'dmy')} />
            <DataLine label='Ngày đăng nhập gần nhất' value={formatDate(myInfoData.last_login, 'dmy')} />
          </div>
        </div>

        <div className='border-l-4 border-gray-200 rounded-sm ml-[15%] h-[105%]'></div>
        
        <div className='flex flex-col justify-center space-y-4 ml-[-65%] mt-[-2%] mr-20'>
          <h2 className='text-3xl font-semibold text-gray-800'>{myInfoData.last_name + ' ' + myInfoData.first_name}</h2>
          <DataLine label='Email' value={myInfoData.email} />
          <DataLine label='Số điện thoại' value={myInfoData.phone_number} />
          <DataLine label='Số CCCD' value={myInfoData.citizen_number} />
          <DataLine label='Giới tính' value={displayGender(myInfoData.gender)} />
          <DataLine label='Ngày sinh' value={formatDate(myInfoData.date_of_birth, 'dmy')} />
          <DataLine label='Vai trò' value={displayRole(myInfoData.role)} />
          <DataLine 
            label='Địa chỉ nơi làm việc'
            value={`${myInfoData.workplace_additional_address}, ${communeData.name}, ${districtData.name}, ${provinceData.name}`}
          />
          <div className='flex space-x-4'>
            <ActionButton 
              mode='edit' 
              onClick={() => router.push('/profile/edit-info')}
            >
              Chỉnh sửa thông tin
            </ActionButton>
            
            <ActionButton 
              mode='edit'
              onClick={() => router.push('/profile/change-password')}
            >
              Đổi mật khẩu
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};
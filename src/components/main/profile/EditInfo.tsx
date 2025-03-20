'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleInputChange } from '@/lib/client/handleInputChange';
import { getMyInfo, setMyInfo } from '@/lib/client/authToken';
import { UserType } from '@/types/UserAccount.type';
import { INITIAL_USER } from '@/initials/UserAccount.initial';
import { userService } from '@/services/UserAccount.service';
import { AuthMessage, UserMessage } from '@/messages/UserAccount.message';
import { handleCancelAlert, toastError, toastSuccess } from '@/lib/client/alert';
import { Validators } from '@/types/Validators.type';
import { DataForm } from '@/components/partial/data/DataForm';
import { Label } from '@/components/partial/form/Label';
import { Input } from '@/components/partial/form/Input';
import { OptionType, Select } from '@/components/partial/form/Select';
import { dateStrOfMaxAge, dateStrOfMinAge } from '@/lib/client/dateLimit';
import { AxiosError } from 'axios';
import { GeneralMessage } from '@/messages/General.message';
import { formatDate } from '@/lib/client/format';
import { CITIZEN_NUMBER_REG_EXP, EMAIL_REG_EXP, PHONE_NUMBER_REG_EXP } from '@/lib/client/isValidForm';
import { mapOptions } from '@/lib/client/handleOptions';
import { communeService, districtService, provinceService } from '@/services/Address.service';
import { CommuneType, DistrictType } from '@/types/Address.type';
import { Loading } from '@/components/partial/data/Loading';

export const EditInfo = () => {
  const router = useRouter();
  const [reqData, setReqData] = useState<UserType>(INITIAL_USER);
  const [loading, setLoading] = useState(true);
  const [provinceOptions, setProvinceOptions] = useState<OptionType[]>([]);
  const [districtOptions, setDistrictOptions] = useState<OptionType[]>([]);
  const [communeOptions, setCommuneOptions] = useState<OptionType[]>([]);
  const originalDistrictDataRef = useRef<DistrictType[]>([]);
  const originalCommuneDataRef = useRef<CommuneType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [provinceData, districtData, communeData] = await Promise.all([
          provinceService.getMany(),
          districtService.getMany(),
          communeService.getMany(),
        ]);
  
        setProvinceOptions(mapOptions(provinceData, ['name'], 'id'));
        setDistrictOptions(mapOptions(districtData, ['name'], 'id'));
        setCommuneOptions(mapOptions(communeData, ['name'], 'id'));
        originalDistrictDataRef.current = districtData;
        originalCommuneDataRef.current = communeData;
  
        const data = await getMyInfo();

        const commune = communeData.find(item => item.id === data.workplace_commune);
        const district = districtData.find(item => item.id === commune?.district);
        const province = provinceData.find(item => item.id === district?.province);

        setReqData({ 
          ...data, 
          _workplace_district: district?.id,
          _workplace_province: province?.id
        });

      } catch {
        await toastError(UserMessage.GET_ERROR);

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    return handleInputChange(e, setReqData);
  };

  const handlePatchError = async (error: unknown) => {
    if (!(error instanceof AxiosError)) {
      await toastError(GeneralMessage.UNKNOWN_ERROR);
      return;
    }
    
    if (error.response?.status !== 400) {
      await toastError(UserMessage.PATCH_ERROR);
      return;
    }
    
    if (error.response?.status === 400 && error.response.data) {
      const data = error.response.data;
      if (
        Object.hasOwn(data, 'email') && 
        data.email[0] === AuthMessage.BACKEND_EMAIL_UNIQUE_ERROR
      ) {
        await toastError(AuthMessage.EMAIL_UNIQUE_ERROR);
        return;
      }

      if (
        Object.hasOwn(data, 'phone_number') && 
        data.phone_number[0] === UserMessage.BACKEND_PHONE_NUMBER_UNIQUE_ERROR
      ) {
        await toastError(UserMessage.PHONE_NUMBER_UNIQUE_ERROR);
        return;
      }

      if (
        Object.hasOwn(data, 'citizen_number') && 
        data.citizen_number[0] === UserMessage.BACKEND_CITIZEN_NUMBER_UNIQUE_ERROR
      ) {
        await toastError(UserMessage.CITIZEN_NUMBER_UNIQUE_ERROR);
        return;
      }
    }

    await toastError(UserMessage.PATCH_ERROR);
  };


  const patchData = async (actionAfter?: () => void) => {
    try {
      await userService.patch(reqData.id ?? '', reqData);
      await setMyInfo(reqData);
      await toastSuccess(UserMessage.PATCH_SUCCESS);
      actionAfter?.();
    
    } catch (error){
      await handlePatchError(error);
    }
  };

  const handleSave = async () => {
    await patchData();
  };

  const handleSaveAndExit = async () => {
    await patchData(() => router.push('/profile'));
  };

  const handleCancel = async () => {
    await handleCancelAlert(() => router.push('/profile'));
  };

  const validators: Validators<UserType> = {
    email: () => {
      if (!reqData.email) {
        return AuthMessage.EMAIL_REQUIRED;
      }

      if (!EMAIL_REG_EXP.test(reqData.email)) {
        return AuthMessage.EMAIL_FORMAT_ERROR;
      }
      return null;
    },

    last_name: () => {
      if (!reqData.last_name) {
        return UserMessage.LAST_NAME_REQUIRED;
      }
      return null;
    },

    first_name: () => {
      if (!reqData.first_name) {
        return UserMessage.FIRST_NAME_REQUIRED;
      }
      return null;
    },

    phone_number: () => {
      if (!reqData.phone_number) {
        return UserMessage.PHONE_NUMBER_REQUIRED;
      }
      if (!PHONE_NUMBER_REG_EXP.test(reqData.phone_number)) {
        return UserMessage.PHONE_NUMBER_FORMAT_ERROR;
      }
      return null;
    },

    citizen_number: () => {
      if (!reqData.citizen_number) {
        return UserMessage.CITIZEN_NUMBER_REQUIRED;
      }
      if (!CITIZEN_NUMBER_REG_EXP.test(reqData.citizen_number)) {
        return UserMessage.CITIZEN_NUMBER_FORMAT_ERROR;
      }
      return null;
    },

    gender: () => {
      if (!reqData.gender) {
        return UserMessage.GENDER_REQUIRED;
      }
      return null;
    },

    _workplace_province: () => {
      if (!reqData._workplace_province) {
        return UserMessage.WORKPLACE_PROVINCE_REQUIRED;
      }
      return null;
    },
    
    _workplace_district: () => {
      if (!reqData._workplace_district) {
        return UserMessage.WORKPLACE_DISTRICT_REQUIRED;
      }
      return null;
    },

    workplace_commune: () => {
      if (!reqData.workplace_commune) {
        return UserMessage.WORKPLACE_COMMUNE_REQUIRED;
      }
      return null;
    },

    workplace_additional_address: () => {
      if (!reqData.workplace_additional_address) {
        return UserMessage.WORKPLACE_ADDITIONAL_ADDRESS_REQUIRED;
      }
      return null;
    }
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReqData({ ...reqData, gender: e.target.value as UserType['gender'] });
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReqData({...reqData, _workplace_province: e.target.value });

    if (e.target.value == '') {
      setDistrictOptions(mapOptions(originalDistrictDataRef.current, ['name'], 'id'));
      setCommuneOptions(mapOptions(originalCommuneDataRef.current, ['name'], 'id'));
    } else {
      const districts = originalDistrictDataRef.current.filter(
        district => district.province === e.target.value
      );
      setDistrictOptions(mapOptions(districts, ['name'], 'id'));

      const communesArray = districts.map(district => originalCommuneDataRef.current.filter(
        commune => commune.district === district.id
      ));
      setCommuneOptions(mapOptions(communesArray.flat(), ['name'], 'id'));
    }
  };
  
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReqData({...reqData, _workplace_district: e.target.value });

    if (e.target.value == '') {
      setCommuneOptions(mapOptions(originalCommuneDataRef.current, ['name'], 'id'));
    } else {
      const communes = originalCommuneDataRef.current.filter(
        commune => commune.district === e.target.value
      );
      setCommuneOptions(mapOptions(communes, ['name'], 'id'));
    }
  };

  const handleCommuneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReqData({ ...reqData, workplace_commune: e.target.value });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <DataForm
      formLabel='Chỉnh sửa thông tin cá nhân'
      saveOnClick={handleSave}
      saveAndExitOnClick={handleSaveAndExit}
      cancelOnClick={handleCancel}
      validators={validators}
    >
      <div className='grid grid-cols-2 items-center'>
        <Label htmlFor='email' required>Email: </Label>
        <Input 
          id='email'
          name='email'
          type='text' 
          className='w-[300px] ml-[-300px]'
          value={reqData.email}
          onChange={handleInputOnChange}
          validate={validators.email}
        />
      </div>

      <div className='grid grid-cols-2 items-center'>
        <Label htmlFor='last-name' required>Họ: </Label>
        <Input 
          id='last-name'
          name='last_name'
          type='text' 
          className='w-[300px] ml-[-300px]'
          value={reqData.last_name}
          onChange={handleInputOnChange}
          validate={validators.last_name}
        />
      </div>

      <div className='grid grid-cols-2 items-center'>
        <Label htmlFor='first-name' required>Tên: </Label>
        <Input 
          id='first-name'
          name='first_name'
          type='text'
          className='w-[300px] ml-[-300px]'
          value={reqData.first_name}
          onChange={handleInputOnChange}
          validate={validators.first_name}
        />
      </div>

      <div className='grid grid-cols-2 items-center'>
        <Label htmlFor='phone-number' required>Số điện thoại: </Label>
        <Input 
          id='phone-number'
          name='phone_number'
          type='text'
          className='w-[300px] ml-[-300px]'
          value={reqData.phone_number}
          onChange={handleInputOnChange}
          validate={validators.phone_number}
        />
      </div>

      <div className='grid grid-cols-2 items-center'>
        <Label htmlFor='citizen-number' required>Số CCCD: </Label>
        <Input 
          id='citizen-number'
          name='citizen_number'
          type='text'
          className='w-[300px] ml-[-300px]'
          value={reqData.citizen_number}
          onChange={handleInputOnChange}
          validate={validators.citizen_number}
        />
      </div>
      
      <div className='grid grid-cols-2 items-center'>
        <Label htmlFor='gender' required>Giới tính: </Label>
        <Select 
          id='gender'
          value={reqData.gender}
          options={[
            { label: 'Nam', value: 'MALE'},
            { label: 'Nữ', value: 'FEMALE'},
            { label: 'Không rõ', value: 'UNKNOWN'},
          ]}
          className='w-[300px] ml-[-300px]'
          onChange={handleGenderChange}
          validate={validators.gender}
          notUseEmptyValue
        />
      </div>

      <div className='grid grid-cols-2 items-center'>
        <Label htmlFor='date-of-birth'>Ngày sinh: </Label>
        <Input 
          id='date-of-birth'
          name='date_of_birth'
          type='date'
          className='w-[300px] ml-[-300px]'
          value={formatDate(reqData.date_of_birth, 'ymd')}
          onChange={handleInputOnChange}
          min={dateStrOfMaxAge}
          max={dateStrOfMinAge}
        />
      </div>


      <div>
        <p className='text-gray-800 text-base font-bold'>
          Địa chỉ nơi làm việc
        </p>
      </div> 
      
      <div className='grid grid-cols-2 items-center'>
        <Label htmlFor='workplace-province' required>Tỉnh/Thành phố: </Label>
        <Select 
          id='workplace-province'
          value={reqData._workplace_province}
          options={provinceOptions}
          className='w-[300px] ml-[-300px]'
          onChange={handleProvinceChange}
          validate={validators._workplace_province}
        />
      </div>

      <div className='grid grid-cols-2 items-center'>
        <Label htmlFor='workplace-district' required>Huyện/Quận/Thị xã: </Label>
        <Select 
          id='-workplace-district'
          value={reqData._workplace_district}
          options={districtOptions}
          className='w-[300px] ml-[-300px]'
          onChange={handleDistrictChange}
          validate={validators._workplace_district}
        />
      </div>

      <div className='grid grid-cols-2 items-center'>
        <Label htmlFor='workplace-commune' required>Xã/Phường/Thị trấn: </Label>
        <Select 
          id='workplace-commune'
          value={reqData.workplace_commune}
          options={communeOptions}
          className='w-[300px] ml-[-300px]'
          onChange={handleCommuneChange}
          validate={validators.workplace_commune}
        />
      </div>

      <div className='grid grid-cols-2 items-center'>
        <Label htmlFor='workplace-additional-address' required>Địa chỉ cụ thể: </Label>
        <Input 
          id='workplace-additional-address'
          name='workplace_additional_address'
          type='text'
          className='w-[300px] ml-[-300px]'
          value={reqData.workplace_additional_address}
          onChange={handleInputOnChange}
          validate={validators.workplace_additional_address}
        />
      </div>
    </DataForm>
  );
};
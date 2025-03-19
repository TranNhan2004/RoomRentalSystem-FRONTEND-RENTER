'use client';
      
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { RegisterUserType } from '@/types/UserAccount.type';
import { INITIAL_REGISTER_USER } from '@/initials/UserAccount.initial';
import { handleInputChange } from '@/lib/client/handleInputChange';
import { Validators } from '@/types/Validators.type';
import { AuthMessage, UserMessage } from '@/messages/UserAccount.message';
import { authService } from '@/services/UserAccount.service';
import { toastError, toastSuccess } from '@/lib/client/alert';
import { Input } from '@/components/partial/form/Input';
import { Form } from '@/components/partial/form/Form';
import { Spin } from '@/components/partial/data/Spin';
import { AxiosError } from 'axios';
import { GeneralMessage } from '@/messages/General.message';
import { Label } from '@/components/partial/form/Label';
import { dateStrOfMaxAge, dateStrOfMinAge } from '@/lib/client/dateLimit';
import { OptionType, Select } from '@/components/partial/form/Select';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/client/format';
import { communeService, districtService, provinceService } from '@/services/Address.service';
import { CommuneType, DistrictType } from '@/types/Address.type';
import { mapOptions } from '@/lib/client/handleOptions';
import { 
  isValidForm, 
  CITIZEN_NUMBER_REG_EXP, 
  EMAIL_REG_EXP, 
  PASSWORD_REG_EXP, 
  PHONE_NUMBER_REG_EXP 
} from '@/lib/client/isValidForm';


export const Register = () => {
  const [reqData, setReqData] = useState<RegisterUserType>(INITIAL_REGISTER_USER);
  const [provinceOptions, setProvinceOptions] = useState<OptionType[]>([]);
  const [districtOptions, setDistrictOptions] = useState<OptionType[]>([]);
  const [communeOptions, setCommuneOptions] = useState<OptionType[]>([]);
  const originalDistrictDataRef = useRef<DistrictType[]>([]);
  const originalCommuneDataRef = useRef<CommuneType[]>([]);

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const fetchOptionData = async () => {
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
    };

    fetchOptionData();
  }, []);
  
  const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    return handleInputChange(e, setReqData);
  };

  const handleRegisterError = async (error: unknown) => {
    if (!(error instanceof AxiosError)) {
      await toastError(GeneralMessage.UNKNOWN_ERROR);
      return;
    }
    
    if (error.response?.status !== 400) {
      await toastError(AuthMessage.REGISTER_ERROR);
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

    await toastError(AuthMessage.REGISTER_ERROR);
  };
  
  
  const validators: Validators<RegisterUserType> = {
    email: () => {
      if (!reqData.email) {
        return AuthMessage.EMAIL_REQUIRED;
      }

      if (!EMAIL_REG_EXP.test(reqData.email)) {
        return AuthMessage.EMAIL_FORMAT_ERROR;
      }
      return null;
    },

    password: () => {
      if (!reqData.password) {
        return AuthMessage.PASSWORD_REQUIRED;
      }
      if (!PASSWORD_REG_EXP.test(reqData.password)) {
        return AuthMessage.PASSWORD_FORMAT_ERROR;
      }
      return null;
    },

    confirm_password: () => {
      if (!reqData.confirm_password) {
        return AuthMessage.CONFIRM_PASSWORD_REQUIRED;
      }
      if (reqData.confirm_password !== reqData.password) {
        return AuthMessage.CONFIRM_PASSWORD_MISMATCH;
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
    setReqData({ ...reqData, gender: e.target.value as RegisterUserType['gender'] });
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

  const handleNextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    if (step < 5) {
      setStep((prev) => prev + 1);
    }
  };
  

  const handlePrevStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await isValidForm(validators);
  
    if (!isValid) {
      return;
    }
    
    setIsSubmitted(true);
    
    try {
      await authService.register(reqData);
      await toastSuccess(AuthMessage.REGISTER_SUCCESS);

    } catch (error) {
      await handleRegisterError(error);
    
    } finally {
      setIsSubmitted(false);
    }

  };

  return (
    <Form 
      label='Đăng ký tài khoản' 
      className='w-[350px]'  
      onSubmit={handleSubmit} 
      useModal
    >
      { 
        step === 1 && (
          <>
            <div className='space-y-1'>
              <Label htmlFor='email' required>Email:</Label>
              <Input 
                id='email'
                name='email'
                type='text' 
                value={reqData.email}
                onChange={handleInputOnChange}
                validate={validators.email}
              />
            </div>

            <div className='space-y-1'>
            <Label htmlFor='password' required>Mật khẩu:</Label>
              <Input 
                id='password'
                name='password'
                type='password' 
                value={reqData.password}
                onChange={handleInputOnChange}
                validate={validators.password}
              />
            </div>

            <div className='space-y-1'>
            <Label htmlFor='confirm-password' required>Nhập lại mật khẩu:</Label>
              <Input 
                id='confirm-password'
                name='confirm_password'
                type='password' 
                value={reqData.confirm_password}
                onChange={handleInputOnChange}
                validate={validators.confirm_password}
              />
            </div>
          </>
        )   
      }
      {
        step === 2 && (
          <>
            <div className='space-y-1'>
              <Label htmlFor='last-name' required>Họ: </Label>
              <Input 
                id='last-name'
                name='last_name'
                type='text' 
                value={reqData.last_name}
                onChange={handleInputOnChange}
                validate={validators.last_name}
              />
            </div>
      
            <div className='space-y-1'>
              <Label htmlFor='first-name' required>Tên: </Label>
              <Input 
                id='first-name'
                name='first_name'
                type='text'
                value={reqData.first_name}
                onChange={handleInputOnChange}
                validate={validators.first_name}
              />
            </div>

            <div className='space-y-1'>
              <Label htmlFor='gender' required>Giới tính: </Label>
              <Select
                id='gender'
                value={reqData.gender}
                options={[
                  { label: 'Nam', value: 'MALE'},
                  { label: 'Nữ', value: 'FEMALE'},
                  { label: 'Không rõ', value: 'UNKNOWN'},
                ]}
                onChange={handleGenderChange}
                validate={validators.gender}
                notUseEmptyValue
              />
            </div>
          </>
        )
      }
      {
        step === 3 && (
          <>
            <div className='space-y-1'>
              <Label htmlFor='phone-number' required>Số điện thoại: </Label>
              <Input 
                id='phone-number'
                name='phone_number'
                type='text'
                value={reqData.phone_number}
                onChange={handleInputOnChange}
                validate={validators.phone_number}
              />
            </div>
      
            <div className='space-y-1'>
              <Label htmlFor='citizen-number' required>Số CCCD: </Label>
              <Input 
                id='citizen-number'
                name='citizen_number'
                type='text'
                value={reqData.citizen_number}
                onChange={handleInputOnChange}
                validate={validators.citizen_number}
              />
            </div>
            
            <div className='space-y-1'>
              <Label htmlFor='date-of-birth'>Ngày sinh: </Label>
              <Input 
                id='date-of-birth'
                name='date_of_birth'
                type='date'
                value={formatDate(reqData.date_of_birth, 'ymd')}
                onChange={handleInputOnChange}
                min={dateStrOfMaxAge}
                max={dateStrOfMinAge}
              />
            </div>
          </>
        )   
      }
      {
        step === 4 && (
          <>
            <div>
              <p className='text-gray-800 text-base font-bold'>
                Địa chỉ nơi làm việc
              </p>
            </div> 

            <div className='space-y-1'>
              <Label htmlFor='workplace-province' required>Tỉnh/Thành phố: </Label>
              <Select 
                id='workplace-province'
                value={reqData._workplace_province}
                options={provinceOptions}
                onChange={handleProvinceChange}
                validate={validators._workplace_province}
              />
            </div>

            <div className='space-y-1'>
              <Label htmlFor='workplace-district' required>Huyện/Quận/Thị xã: </Label>
              <Select 
                id='-workplace-district'
                value={reqData._workplace_district}
                options={districtOptions}
                onChange={handleDistrictChange}
                validate={validators._workplace_district}
              />
            </div>

            <div className='space-y-1'>
              <Label htmlFor='workplace-commune' required>Xã/Phường/Thị trấn: </Label>
              <Select 
                id='workplace-commune'
                value={reqData.workplace_commune}
                options={communeOptions}
                onChange={handleCommuneChange}
                validate={validators.workplace_commune}
              />
            </div>
          </>
        )
      }
      {
        step === 5 && (
          <>
            <div>
              <p className='text-gray-800 text-base font-bold'>
                Địa chỉ nơi làm việc
              </p>
            </div> 

            <div className='space-y-1'>
              <Label htmlFor='workplace-additional-address' required>Địa chỉ cụ thể: </Label>
              <div className='flex items-center space-x-2'>
                <Input 
                  id='workplace-additional-address'
                  name='workplace_additional_address'
                  type='text'
                  className='w-[360px]'
                  value={reqData.workplace_additional_address}
                  onChange={handleInputOnChange}
                  validate={validators.workplace_additional_address}
                />
                <button
                  type='button'
                  className='w-6 h-6 bg-gray-300 rounded-full hover:bg-gray-400'
                  onClick={() => alert(`
1. Lưu ý, để hệ thống tính toán chính xác, nên tra trước địa chỉ đang làm việc hiện tại của bạn trên Google Maps để xác minh. Nêu không tồn tại địa chỉ chính xác thì dùng tạm 1 địa chỉ lân cận.
2. Sau khi xác minh xong, hãy nhập địa chỉ cụ thể theo cú pháp sau:
2.1. Nếu là tòa nhà, thì nhập đúng tên tòa nhà.
2.2. Nếu dùng số nhà thì cần nhập theo cú pháp <Số nhà>, Hẻm <Số hẻm>, Đ. <Tên đường>. Ví dụ: 123, Hẻm 12, Đ. Trần Hưng Đạo
                  `)}
                >
                  <span className='text-gray-800 font-bold'>?</span>
                </button>
              </div>
            </div>
            
            <div>
              <p className='italic text-gray-500 text-sm'>
                Vui lòng truy cập vào email của bạn để lấy liên kết kích hoạt tài khoản
              </p>
            </div> 
          </>
        )
      }
  
      <div>
        <Link href={'/auth/login'} className='underline text-blue-500 text-left'>Đã có tài khoản? Đăng nhập ngay</Link>
      </div>

      <div className='text-left italic font-bold'>
        <p>Bước {step}/5</p>
      </div>

      <div className='flex justify-between mt-4'>
        {
          step > 1 && (
            <button 
              type='button' 
              className='px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400'
              onClick={handlePrevStep}
            >
              <div className='flex items-center'>
                <ChevronLeftIcon className='w-5 h-5'/> Trước đó
              </div>
            </button>
          )
        }
        {
          step < 5 ? (
            <button 
              type='button' 
              className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-800`}
              onClick={handleNextStep}
            >
              <div className='flex items-center'>
                Kế tiếp <ChevronRightIcon className='w-5 h-5'/>
              </div>
            </button>
          ) : (
            <button 
              type='submit' 
              className={`font-semibold px-4 py-2 text-white rounded-lg
                        ${isSubmitted ? 
                          'bg-mydarkgreen cursor-not-allowed disabled' : 
                          'bg-mygreen hover:bg-mydarkgreen transition duration-300 ease-in-out'}`}
              onClick={handleSubmit}
            >
              {isSubmitted ? <Spin /> : 'Hoàn tất'}
            </button>
          )
        }
      </div>
    </Form>
  );
};
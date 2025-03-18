'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { handleInputChange } from '@/lib/client/handleInputChange';
import { useRouter } from 'next/navigation';
import { handleLogin } from '@/lib/client/authToken';
import { LoginRequestType } from '@/types/UserAccount.type';
import { authService } from '@/services/UserAccount.service';
import { toastError } from '@/lib/client/alert';
import { AuthMessage } from '@/messages/UserAccount.message';
import { INITIAL_LOGIN_REQUEST } from '@/initials/UserAccount.initial';
import { EMAIL_REG_EXP, PASSWORD_REG_EXP, isValidForm } from '@/lib/client/isValidForm';
import { Form } from '@/components/partial/form/Form';
import { Input } from '@/components/partial/form/Input';
import { Spin } from '@/components/partial/data/Spin';
import { Validators } from '@/types/Validators.type';

export const Login = () => {
  const router = useRouter();
  const [reqData, setReqData] = useState<LoginRequestType>(INITIAL_LOGIN_REQUEST);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    return handleInputChange(e, setReqData);
  };

  const validators: Validators<LoginRequestType> = {
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
      const data = await authService.login(reqData);
      await handleLogin(data);
      router.replace('/');
    } catch {
      await toastError(AuthMessage.LOGIN_ERROR);
      setIsSubmitted(false);
    }
  };

  return (
    <Form label='ROOM RENTAL' className='w-[300px]' onSubmit={handleSubmit} useModal>
      <div>
        <Input
          id='email'
          name='email'
          type='text'
          placeholder='Email'
          value={reqData.email}
          onChange={handleInputOnChange}
          validate={validators.email}
        />
      </div>

      <div>
        <Input 
          id='password'
          name='password'
          type='password'
          placeholder='Mật khẩu'
          value={reqData.password}
          onChange={handleInputOnChange}
          validate={validators.password}
        />
      </div>

      <div className='flex justify-between'>
        <Link href={'/auth/reset-password'} className='underline text-sm text-blue-500 text-left'>Quên mật khẩu?</Link>
        <Link href={'/auth/register'} className='underline text-sm text-blue-500 text-left'>Đăng ký ngay</Link>
      </div>

      <div className='flex justify-center'>
        <button type='submit' className={`font-semibold p-2 w-[50%] mt-2 text-white rounded-lg
                                          ${isSubmitted ? 
                                            'bg-mydarkgreen cursor-not-allowed disabled' : 
                                            'bg-mygreen hover:bg-mydarkgreen transition duration-300 ease-in-out'}`}>
          {isSubmitted ? <Spin /> : 'Đăng nhập'}
        </button>
      </div>
    </Form>
  );
};
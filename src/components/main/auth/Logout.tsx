'use client';

import React, { useEffect, useRef } from 'react';
import { resetAuthTokens } from '@/lib/client/authToken';
import { useRouter } from 'next/navigation';
import { 
  getSearchFromLocalStorage, 
  removeSearchFromLocalStorage, 
  searchRoomHistoryService 
} from '@/services/SearchRoomHistory.service';

export const Logout = () => {
  const router = useRouter();
  const hasRun = useRef(false); 

  useEffect(() => {
    if (hasRun.current) return; 
    hasRun.current = true;

    const postSearchRoomHistory = async () => {
      await resetAuthTokens();
      const searchRoomHistory = await getSearchFromLocalStorage();
      
      if (searchRoomHistory.length > 0) {
        await Promise.all(searchRoomHistory.map(item => searchRoomHistoryService.post(item)));    
        await removeSearchFromLocalStorage();
      }
      router.refresh();
    };

    postSearchRoomHistory();
  }, [router]);

  return (
    <div className='flex items-center justify-center text-lg space-x-2'>
      <h1>Đang đăng xuất</h1>
      <span className="dot animate-bounce1">.</span>
      <span className="dot animate-bounce2">.</span>
      <span className="dot animate-bounce3">.</span>
    </div>
  );
};
'use client';
                          
import React from 'react';

type TaskbarProps = {
  children: React.ReactNode;
}

export const Taskbar = (props: TaskbarProps) => {
  return (
    <div className='w-full h-[60px] rounded-lg bg-mygreen2 shadow-md px-6'>
      <div className='flex items-center justify-between h-full w-full'>
        {props.children}
      </div>
    </div>
  );
};
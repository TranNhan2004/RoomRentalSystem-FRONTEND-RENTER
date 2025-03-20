'use client';

import React from 'react';

type LoadingProps = {
  textSize?: number;
  useOnlyDot?: boolean;
}

export const Loading = (props: LoadingProps) => {
  return (
    <div 
      className="flex items-center space-x-2"
      style={{
        fontSize: `${props.textSize ?? 20}pt`,
      }}
    >
      {!props.useOnlyDot && <p>Đang tải dữ liệu</p>}
      <span className="dot animate-bounce1">.</span>
      <span className="dot animate-bounce2">.</span>
      <span className="dot animate-bounce3">.</span>
    </div>
  );
};
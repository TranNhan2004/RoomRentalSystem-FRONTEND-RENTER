'use client';

import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid'; 
import { StarIcon as StarOutline } from '@heroicons/react/24/outline'; 
import { round } from '@/lib/client/format';

type RatingStarProps = {
  value: number;
  isEdit?: boolean;
  setRating?: (rating: number) => void;
};

export const RatingStar = (props: RatingStarProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null); 

  const handleClick = (starValue: number) => {
    if (props.isEdit && props.setRating) {
      props.setRating(starValue); 
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (props.isEdit) {
      setHoverValue(starValue); 
    }
  };

  const handleMouseLeave = () => {
    if (props.isEdit) {
      setHoverValue(null); 
    }
  };

  return (
    <div className='flex items-center gap-2'>
      {
        Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const displayValue = props.isEdit ? (hoverValue ?? props.value) : props.value; 
    
          const isFullStar = starValue <= Math.floor(displayValue);
          const isFractionStar = !props.isEdit && starValue === Math.ceil(displayValue) && !Number.isInteger(displayValue);
          const starPercents = !props.isEdit ? Math.floor((round(props.value, 1) - Math.floor(props.value)) * 100) : 0;
          
          return (
            <span
              key={starValue}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              className={props.isEdit ? 'cursor-pointer' : ''} 
            >
              {
                isFullStar ? (
                  <StarIcon className='h-5 w-5 text-yellow-500' />
                ) : isFractionStar ? (
                  <div className='relative h-5 w-5 text-yellow-500'>
                    <StarIcon
                      className='absolute inset-0 h-5 w-5 text-yellow-500'
                      style={{ clipPath: `inset(0 ${100 - starPercents}% 0 0)` }}
                    />
                    <StarOutline className='absolute inset-0 h-5 w-5 text-yellow-500' />
                  </div>
                ) : (
                  <StarOutline className='h-5 w-5 text-yellow-500' />
                )
              }
            </span>
          );
        })
      }
    </div>
  );
};
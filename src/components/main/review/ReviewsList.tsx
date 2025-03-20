'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { handleCancelAlert, toastError, toastSuccess } from '@/lib/client/alert';
import { Title } from '@/components/partial/data/Title';
import { Sorting } from '@/components/partial/data/Sorting';
import { FilterModal } from '@/components/partial/data/FilterModal';
import { Label } from '@/components/partial/form/Label';
import { handleInputChange } from '@/lib/client/handleInputChange';
import { Input } from '@/components/partial/form/Input';
import { Validators } from '@/types/Validators.type';
import { formatDate } from '@/lib/client/format';
import { ReviewQueryType, ReviewType } from '@/types/Review.type';
import { INITIAL_REVIEW, INITIAL_REVIEW_QUERY } from '@/initials/Review.initial';
import { ReviewMessage } from '@/messages/Review.message';
import { Select } from '@/components/partial/form/Select';
import { reviewService } from '@/services/Review.service';
import { Loading } from '@/components/partial/data/Loading';
import { ReviewCard } from './ReviewCard';
import { PaginationNav } from '@/components/partial/data/PaginationNav';
import { getMyInfo } from '@/lib/client/authToken';
import { ActionButton } from '@/components/partial/button/ActionButton';
import { RatingStar } from '@/components/partial/data/RatingStar';


type ReviewsListProps = {
  roomId: string;
}

const avatarColorClassName = [
  'text-[#27445D]', // Xanh navy đậm
  'text-[#497D74]', // Xanh lam ngả lục
  'text-[#71BBB2]', // Xanh ngọc nhạt
  'text-[#B2A5FF]', // Tím pastel
  'text-[#F2B28C]', // Cam nhạt
  'text-[#EFB036]'  // Vàng đậm
];


export const ReviewsList = (props: ReviewsListProps) => {
  const [data, setData] = useState<ReviewType[]>([]);
  const [displayedData, setDisplayedData] = useState<ReviewType[]>([]);
  const [query, setQuery] = useState<ReviewQueryType>(INITIAL_REVIEW_QUERY);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [reqData, setReqData] = useState<ReviewType>(INITIAL_REVIEW);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const originalDataRef = useRef<ReviewType[]>([]);
  const myIdRef = useRef<string | undefined>(undefined);

  const cardsPerPage = 30;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getMany({ rental_room: props.roomId });
        myIdRef.current = (await getMyInfo()).id;
        originalDataRef.current = data;
        setData([...originalDataRef.current]);
        
    
      } catch {
        await toastError(ReviewMessage.GET_MANY_ERROR);
    
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [props.roomId]);

  useEffect(() => {
    setDisplayedData([...data.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage)]);
  }, [data, currentPage]);

  const filterOnClick = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getMany({ 
        ...query,
        rental_room: props.roomId,
        from_created_date: formatDate(query.from_created_date as Date, 'ymd'),
        to_created_date: formatDate(query.to_created_date as Date, 'ymd'),
      });

      originalDataRef.current = data;
      setData(data);
      
    } catch {
      await toastError(ReviewMessage.GET_MANY_ERROR);
    
    } finally {
      setLoading(false);
    }
  };

  const refreshOnClick = () => {
    setQuery(INITIAL_REVIEW_QUERY);
  };

  const dateValidators: Validators<ReviewQueryType> = {
    to_created_date: () => {
      if (query.from_created_date && query.to_created_date && query.to_created_date < query.from_created_date) {
        return ReviewMessage.TO_CREATED_DATE_INVALID;
      } 
      return null;
    }
  };

  const handleQueryInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e, setQuery);
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '') {
      setQuery({ ...query, rating: undefined });
    
    } else {
      setQuery({ ...query, rating: parseInt(e.target.value) });
    }
  };

  const onPageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const deleteFunction = async (id: string) => {
    try {
      await reviewService.delete(id);
      await toastSuccess(ReviewMessage.DELETE_SUCCESS);
      originalDataRef.current = originalDataRef.current.filter(item => item.id !== id);
      setData([...originalDataRef.current]);
      
    } catch {
      await toastError(ReviewMessage.DELETE_ERROR);
    }
  };

  const handlePostCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 2000) {
      setReqData({ ...reqData, comment: newValue });
    }
  };

  const handlePostClick = async () => {
    try {
      setIsSubmitted(true);
      const reviewData = await reviewService.post({
        ...reqData,
        rental_room: props.roomId,
        renter: myIdRef.current
      });
      await toastSuccess(ReviewMessage.POST_SUCCESS);
      originalDataRef.current.unshift(reviewData);
      setData([...originalDataRef.current]);
      setCurrentPage(1);
      
    } catch {
      await toastError(ReviewMessage.POST_ERROR);
    
    } finally {
      setIsSubmitted(false);
      setReqData(INITIAL_REVIEW);
    }
  };
  
  const handleCancelClick = async () => {
    await handleCancelAlert(() => {
      setReqData(INITIAL_REVIEW);
    });
  };
  
  const setPostRating = (starValue: number) => {
    setReqData({ ...reqData, rating: starValue });
  };

  const memoReviewCards = useMemo(() => {
    return displayedData.length === 0 
      ? 'Không có dữ liệu' 
      : displayedData.map((item, index) => {
        const randomAvatarColorClassName = avatarColorClassName[index % avatarColorClassName.length];
        return (
          <ReviewCard
            key={item.id}
            ordinal={index + 1}
            avatarColorClassName={randomAvatarColorClassName}
            item={item}
            myId={myIdRef.current ?? ''}
            deleteFunction={deleteFunction}
          />
        );
      }); 
  }, [displayedData]);

  
  return (
    <div>
      <Title>Các đánh giá</Title>
      <div className='flex items-center'>
        <div>
          <Sorting
            options={[
              { label: 'Mới nhất', value: 'desc-created_at' },
              { label: 'Cũ nhất', value: 'asc-created_at' },
            ]}
            originalData={originalDataRef.current}
            data={data}
            setData={setData}
          />
        </div>

        <div className='ml-[10px]'>
          <FilterModal 
            filterOnClick={filterOnClick}
            refreshOnClick={refreshOnClick}
          >
            <div className='grid grid-cols-2 items-center mt-1 mb-1'>
              <Label htmlFor='from-created-date-query'>Từ ngày: </Label>
              <Input
                id='from-created-date-query'
                name='from_created_date'
                type='date'
                value={formatDate(query.from_created_date as Date, 'ymd')}
                className='ml-[-200px] w-[300px]'
                onChange={handleQueryInputOnChange}
              />
            </div>  

            <div className='grid grid-cols-2 items-center mt-1 mb-1'>
              <Label htmlFor='to-created-date-query'>Đến ngày: </Label>
              <Input
                id='to-created-date-query'
                name='to_created_date'
                type='date'
                value={formatDate(query.to_created_date as Date, 'ymd')}
                className='ml-[-200px] w-[300px]'
                onChange={handleQueryInputOnChange}
                validate={dateValidators.to_created_date}
              />
            </div>

            <div className='grid grid-cols-2 items-center mt-1 mb-1'>
              <Label htmlFor='rating-query'>Đánh giá: </Label>
              <Select
                id='rating-query'
                value={query.rating?.toString()}
                className='ml-[-200px] w-[300px]'
                options={[
                  { label: '1 Sao', value: '1' }, 
                  { label: '2 Sao', value: '2' }, 
                  { label: '3 Sao', value: '3' }, 
                  { label: '4 Sao', value: '4' }, 
                  { label: '5 Sao', value: '5' }, 
                ]}
                onChange={handleRatingChange}
              />
            
            </div>    
          </FilterModal>
        </div>
      </div>

      <div className='mt-10'>
        <div className='mb-2 flex items-center space-x-2'>
          <p><b>Số sao:</b></p>
          <RatingStar
            value={reqData.rating ?? 0}
            setRating={setPostRating}
            isEdit
          />
        </div>
      
        <div className='border border-[1.5px] border-gray-200 bg-white rounded-lg shadow-xs h-40 w-full'>
          <div className='h-full px-6 py-4 break-words'>
            <div className='relative h-[90%]'>
              <textarea
                value={reqData.comment}
                onChange={handlePostCommentChange}
                className='w-full h-full border-0 rounded resize-none focus:outline-none'
                placeholder='Bình luận của bạn...'
              />
              <div className='absolute bottom-[-18px] right-2 text-xs text-gray-500'>
                {reqData.comment?.trim().length} / 2000 ký tự
              </div>
            </div>
          </div>
        </div>

        <div className='mt-3 flex justify-end space-x-2'>
          <ActionButton 
            mode='save'
            onClick={handlePostClick}
            disabled={isSubmitted || reqData.comment?.trim().length === 0 || reqData.rating === 0}
          >
            Đăng
          </ActionButton>

          <ActionButton 
            mode='cancel'
            onClick={handleCancelClick}
            disabled={isSubmitted}
          >
            Hủy
          </ActionButton>
        </div>
      </div>
      
      {
        loading ? (
          <div className='mt-5'>
            <Loading textSize={12} />
          </div>
        ) : (
          <>  
            <div className='mt-20 mb-8'>
              {memoReviewCards}
            </div>
            <PaginationNav
              totalPages={Math.ceil(data.length / cardsPerPage)}
              currentPage={currentPage}
              onPageChange={onPageChange}
              step={6}
            />
          </>
        )
      }
      
    </div>
  );
};
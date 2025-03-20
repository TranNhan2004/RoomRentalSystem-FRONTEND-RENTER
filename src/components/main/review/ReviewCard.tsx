'use client';

import { ReviewType } from '@/types/Review.type';
import React, { useState } from 'react';
import { UserCircleIcon, EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { RatingStar } from '@/components/partial/data/RatingStar';
import { formatDate } from '@/lib/client/format';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ActionButton } from '@/components/partial/button/ActionButton';
import { handleCancelAlert, toastError, toastSuccess } from '@/lib/client/alert';
import { ReviewMessage } from '@/messages/Review.message';
import { reviewService } from '@/services/Review.service';
import { Loading } from '@/components/partial/data/Loading';

type ReviewCardProps = {
  ordinal: number;
  avatarColorClassName: string;
  item: ReviewType;
  myId: string;
  deleteFunction: (id: string) => void;
};

export const ReviewCard = (props: ReviewCardProps) => {
  const [item, setItem] = useState<ReviewType>(props.item);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reqData, setReqData] = useState<ReviewType>(props.item);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEditClick = () => {
    setIsEdit(true);
    setReqData({ ...reqData, comment: props.item.comment, rating: 0 });
    setIsMenuOpen(false);
  };

  const handleCancelClick = async () => {
    await handleCancelAlert(() => {
      setItem({ ...item, comment: props.item.comment, rating: props.item.rating });
      setIsEdit(false);
    });
  };

  const handleEditCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 2000) {
      setReqData({ ...reqData, comment: newValue });
    }
  };

  const handleSaveClick = async () => {
    try {
      setIsEdit(false);
      setIsSubmitted(true);
      await reviewService.patch(props.item.id ?? '', reqData);
      await toastSuccess(ReviewMessage.PATCH_SUCCESS);
      setItem(reqData);
    
    } catch {
      await toastError(ReviewMessage.PATCH_ERROR);
    
    } finally {
      setIsSubmitted(false);
    }
  };

  const handleDeleteClick = async () => {
    setIsMenuOpen(false);
    props.deleteFunction(props.item.id ?? '');
  };

  const setEditRating = (starValue: number) => {
    setReqData({ ...reqData, rating: starValue });
  };

  return (
    <div className='w-full mb-8'>
      <div className='flex items-start justify-between'>
        <div className='flex items-start space-x-3'>
          <UserCircleIcon className={`h-10 w-10 ${props.avatarColorClassName}`} />
          <div>
            <h3 className='text-sm font-semibold text-gray-800'>
              Người ẩn danh {props.ordinal}
            </h3>
            {
              isSubmitted ? (
                <Loading textSize={10} useOnlyDot />
              ) : (
                <RatingStar
                  value={(isEdit ? reqData.rating : item.rating) ?? 0}
                  isEdit={isEdit}
                  setRating={setEditRating}
                />
              )
            }
          </div>
        </div>

        <div className='flex items-center space-x-2 mt-[1%]'>
          <div className='text-sm text-gray-500'>
            <span>Ngày đăng: {formatDate(item.created_at, 'dmy')}</span>
            {
              item.updated_at && item.created_at !== item.updated_at && (
                <>
                  <span className='text-gray-400'> • </span>
                  <span>Đã chỉnh sửa lúc: {formatDate(item.updated_at, 'dmy')}</span>
                </>
              )
            }
          </div>
          <div className='relative'>
            <button onClick={toggleMenu}>
              <EllipsisVerticalIcon className='h-6 w-6 text-gray-500' />
            </button>
            {
              props.item.renter === props.myId && isMenuOpen && (
                <div className='absolute right-0 mt-1 mr-[-5px] w-48 bg-gray-50 border border-gray-200 rounded-md shadow-lg z-10'>
                  <button
                    className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200'
                    onClick={handleEditClick}
                  >
                    <div className='flex items-center'>
                      <PencilSquareIcon className='w-5 h-5 mr-2' />
                      Chỉnh sửa
                    </div>
                  </button>
                  <button 
                    className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200'
                    onClick={handleDeleteClick}
                  >
                    <div className='flex items-center'>
                      <TrashIcon className='w-5 h-5 mr-2' />
                      Xóa
                    </div>
                  </button>
                </div>
              )
            }
          </div>
        </div>
      </div>

      <div className='mt-3 border border-[1.5px] border-gray-200 bg-white rounded-lg shadow-xs h-40 w-full'>
        <div className='h-full px-6 py-4 break-words'>
          {
            isEdit ? (
              <div className='relative h-[90%]'>
                <textarea
                  value={reqData.comment}
                  onChange={handleEditCommentChange}
                  className='w-full h-full border-0 rounded resize-none focus:outline-none'
                />
                <div className='absolute bottom-[-18px] right-2 text-xs text-gray-500'>
                  {reqData.comment?.trim().length} / 2000 ký tự
                </div>
              </div>
            ) : (
              isSubmitted ? (
                <Loading textSize={10} useOnlyDot />
              ) : (
                <div className='max-h-[95%] overflow-y-auto'>
                  <p className='text-sm'>{item.comment}</p>
                </div>
              )
            )
          }
        </div>
      </div>

      {
        isEdit && (
          <div className='mt-3 flex items-center justify-end space-x-4'>
            <ActionButton
              mode='save'
              onClick={handleSaveClick}
              disabled={reqData.comment?.trim().length === 0 || reqData.rating === 0}
            >
              Lưu
            </ActionButton>
            <ActionButton mode='cancel' onClick={handleCancelClick}>
              Hủy
            </ActionButton>
          </div>
        )
      }
    </div>
  );
};
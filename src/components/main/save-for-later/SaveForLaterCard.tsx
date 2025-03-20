'use client';


import React, { useState } from 'react';
import { DataLine } from '@/components/partial/data/DataLine';
import { SaveForLaterType } from '@/types/SaveForLater.type';
import { formatDate } from '@/lib/client/format';
import { handleInputChange } from '@/lib/client/handleInputChange';
import { Input } from '@/components/partial/form/Input';
import { ActionButton } from '@/components/partial/button/ActionButton';
import { handleCancelAlert, toastError, toastSuccess } from '@/lib/client/alert';
import { saveForLaterService } from '@/services/SaveForLater.service';
import { SaveForLaterMessage } from '@/messages/SaveForLater.message';

type SaveForLaterCardProps = {
  ordinal: number;
  item: SaveForLaterType;
  deleteFunction: (id: string) => void;
  redirectFunction: (id: string) => void;
}

export const SaveForLaterCard = (props: SaveForLaterCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reqData, setReqData] = useState<SaveForLaterType>(props.item);

  const menuOpenOnClick = () => setIsMenuOpen(!isMenuOpen);
    
  const saveOnClick = async () => {
    try {
      await saveForLaterService.patch(props.item.id ?? '', reqData);
      await toastSuccess(SaveForLaterMessage.PATCH_SUCCESS);

    } catch {
      await toastError(SaveForLaterMessage.PATCH_ERROR);
    
    } finally {
      setIsMenuOpen(false); 
    }
  };

  const cancelOnClick = async () => {
    await handleCancelAlert(() => {
      setReqData(props.item);
      setIsMenuOpen(false);
    });
  };

  const deleteOnClick = async () => {
    setIsDeleting(true);
    await props.deleteFunction(props.item.id ?? '');
    setIsDeleting(false);
  };

  const redirectToRoomClick = () => {
    props.redirectFunction(props.item.rental_room ?? '');
  };
  
  return (
    <>
      <div className='w-[550px] h-48 border border-gray-400 flex flex-col items-center rounded-lg overflow-hidden shadow-md'>
        <div className={`w-full bg-blue-300 text-white text-center py-2 text-lg font-semibold`}>
          {props.ordinal}
        </div>
        <div className='flex-1 w-full bg-white ml-6 mt-4'>
          <DataLine label='Tên trọ' value={props.item._room_name} />
          <DataLine label='Ghi chú' value={reqData.notes} />
          <DataLine label='Ngày tạo' value={formatDate(props.item.created_at, 'dmy')} />
        </div>

        <div className='flex justify-end ml-auto mr-4 space-x-4 mb-3'>
          <ActionButton mode='redirect' onClick={redirectToRoomClick} disabled={isDeleting}>
            Đi đến phòng trọ
          </ActionButton>

          <ActionButton mode='edit' onClick={menuOpenOnClick} disabled={isDeleting}>
            Chỉnh sửa
          </ActionButton>

          <ActionButton mode='delete' onClick={deleteOnClick} disabled={isDeleting}>
            Xóa
          </ActionButton>
        </div>
      </div>
      
      {
        isMenuOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-lg w-[40%] h-[40%] relative flex flex-col'>
              <h2 className='text-xl font-semibold mb-4 flex justify-center items-center'>Chỉnh sửa ghi chú</h2>

              <div className='flex-1'>
                <Input
                  id='notes'
                  name='notes'
                  type='text'
                  placeholder='Ghi chú của bạn'
                  value={reqData.notes}
                  onChange={(e) => handleInputChange(e, setReqData)}
                />
              </div>

              <div className='flex items-center justify-center gap-4'>
                <ActionButton mode='save' onClick={saveOnClick}>Lưu</ActionButton>
                <ActionButton mode='cancel' onClick={cancelOnClick}>Hủy</ActionButton>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};
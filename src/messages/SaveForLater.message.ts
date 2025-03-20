export class SaveForLaterMessage {
  public static readonly BACKEND_UNIQUE_FIELDS_ERROR = 'The fields rental_room, renter must make a unique set.';
  
  public static readonly GET_MANY_ERROR = 'Đã xảy ra lỗi khi lấy danh sách các bản ghi xem sau!';
  public static readonly POST_ERROR = 'Đã xảy ra lỗi khi tạo bản ghi xem sau mới!';
  public static readonly PATCH_ERROR = 'Đã xảy ra lỗi khi chỉnh sửa bản ghi xem sau!';
  public static readonly DELETE_ERROR = 'Đã xảy ra lỗi khi xóa bản ghi xem sau!';

  public static readonly POST_SUCCESS = 'Tạo bản ghi xem sau mới thành công!';
  public static readonly PATCH_SUCCESS = 'Chỉnh sửa bản ghi xem sau thành công!';
  public static readonly DELETE_SUCCESS = 'Xóa bản ghi xem sau thành công!';
}
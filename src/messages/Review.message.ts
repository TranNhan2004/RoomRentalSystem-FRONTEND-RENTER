export class ReviewMessage {
  public static readonly TO_CREATED_DATE_INVALID = 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu!';
  
  public static readonly GET_MANY_ERROR = 'Đã xảy ra lỗi khi lấy danh sách các đánh giá!';
  public static readonly POST_ERROR = 'Đã xảy ra lỗi khi tạo đánh giá mới!';
  public static readonly PATCH_ERROR = 'Đã xảy ra lỗi khi chỉnh sửa đánh giá!';
  public static readonly DELETE_ERROR = 'Đã xảy ra lỗi khi xóa đánh giá!';

  public static readonly POST_SUCCESS = 'Tạo đánh giá mới thành công!';
  public static readonly PATCH_SUCCESS = 'Chỉnh sửa đánh giá thành công!';
  public static readonly DELETE_SUCCESS = 'Xóa đánh giá thành công!';
}
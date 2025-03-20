export class RentalRoomMessage {
  public static readonly GET_MANY_ERROR = 'Đã xảy ra lỗi khi lấy danh sách phòng trọ!';
  public static readonly GET_ERROR = 'Đã xảy ra lỗi khi lấy thông tin phòng trọ theo ID!';
}

export class RoomImageMessage {
  public static readonly GET_MANY_ERROR = 'Đã xảy ra lỗi khi lấy danh sách các ảnh trọ!';
}

export class ChargesMessage {
  public static readonly GET_MANY_ERROR = 'Đã xảy ra lỗi khi lấy danh sách các mức giá!';
  public static readonly GET_ERROR = 'Đã xảy ra lỗi khi lấy thông tin mức giá theo ID!';
}

export class RoomCodeMessage {
  public static readonly GET_MANY_ERROR = 'Đã xảy ra lỗi khi lấy danh sách các mã phòng!';
  public static readonly GET_ERROR = 'Đã xảy ra lỗi khi lấy thông tin mã phòng theo ID!';  
  public static readonly SHARE_ERROR = 'Đã xảy ra lỗi khi chia sẻ phòng!';
  public static readonly STOP_SHARE_ERROR = 'Đã xảy ra lỗi khi dừng chia sẻ phòng!';

  public static readonly SHARE_SUCCESS = 'Chia sẻ phòng thành công!';
  public static readonly STOP_SHARE_SUCCESS = 'Dừng chia sẻ phòng thành công!';
}

export class MonitoringRentalMessage {
  public static readonly GET_MANY_ERROR = 'Đã xảy ra lỗi khi lấy danh sách các bản ghi theo dõi cho thuê!';
  public static readonly END_DATE_INVALID = 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu';
}

export class MonthlyRoomInvoiceMessage {
  public static readonly GET_MANY_ERROR = 'Đã xảy ra lỗi khi lấy danh sách các hóa đơn tiền trọ hằng tháng!';
  public static readonly END_DATE_INVALID = 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu';
}
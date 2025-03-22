import { DistrictType, ProvinceType } from "./Address.type";
import { RecommendationType } from "./Recommendation.type";

export type RentalRoomType = {
  id?: string;
  name?: string;
  commune?: string;
  additional_address?: string;
  closing_time?: string;
  total_number?: number;
  _room_charge?: ChargesType['room_charge'];
  _image?: RoomImageType['image'];
  _distance_value?: number;
  _save_for_later?: string;
  _recommendation_list?: RecommendationType[];
  further_description?: string;
  average_rating?: number;
  lessor?: string;
  manager?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type RentalRoomQueryType = {
  commune?: RentalRoomType['commune'];
  lessor?: RentalRoomType['lessor'];
  manager_is_null?: boolean;
  _room_charge_range?: string;
  _empty_mode?: string;
  _province?: ProvinceType['id'];
  _district?: DistrictType['id'];
  _renter?: string;
};

export type ChargesType = {
  id?: string;
  rental_room?: string;
  room_charge?: number;
  deposit?: number;
  electricity_charge?: number;
  water_charge?: number;
  wifi_charge?: number;
  rubbish_charge?: number;
  start_date?: Date;
  end_date?: Date;
}

export type RoomCodeType = {
  id?: string;
  value?: string;
  rental_room?: string;
  max_occupancy?: number;
  current_occupancy?: number;
  is_shared?: boolean;
}

export type MonthlyRoomInvoiceType = {
  id?: string;
  room_code?: string;
  old_kWh_reading?: number;
  new_kWh_reading?: number;
  old_m3_reading?: number;
  new_m3_reading?: number;
  prev_remaining_charge?: number;
  due_charge?: number;
  paid_charge?: number;
  continue_renting?: boolean;
  is_settled?: boolean;
  created_mode?: 'first' | 'auto';
  created_at?: Date;
  updated_at?: Date;
}

export type MonitoringRentalType = {
  id?: string;
  room_code?: string;
  renter?: string;
  _room_name?: RentalRoomType['name'];
  _room_code_obj?: RoomCodeType;
  start_date?: Date;
  end_date?: Date;
}

export type RoomImageType = {
  id?: string;
  rental_room?: string;
  image?: File | string;
}

export type RoomImageQueryType = {
  rental_room?: RoomImageType['rental_room'];
  first_only?: boolean;
}

export type ChargesQueryType = {
  rental_room?: ChargesType['rental_room'];
  from_date?: Date | string;
  to_date?: Date | string;
  first_only?: boolean;
}

export type RoomCodeQueryType = {
  rental_room?: RoomCodeType['rental_room'];
}

export type MonthlyRoomInvoiceQueryType = {
  room_code?: MonthlyRoomInvoiceType['room_code'];
  is_settled?: MonthlyRoomInvoiceType['is_settled'];
  from_created_date?: Date | string;
  to_created_date?: Date | string;
}

export type MonitoringRentalQueryType = {
  room_code?: MonitoringRentalType['room_code'];
  renter?: MonitoringRentalType['renter'];
  from_date?: Date | string;
  to_date?: Date | string;
}
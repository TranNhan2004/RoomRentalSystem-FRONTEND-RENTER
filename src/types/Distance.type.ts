export type DistanceType = {
  id?: string;
  value?: number;
  rental_room?: string;
  renter?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type DistanceQueryType = {
  renter?: DistanceType['renter'];
  rental_room?: DistanceType['rental_room'];
}
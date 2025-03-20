export type SaveForLaterType = {
  id?: string;
  notes?: string
  rental_room?: string;
  renter?: string;
  _room_name?: string;
  created_at?: Date;
}

export type SaveForLaterQueryType = {
  renter?: SaveForLaterType['renter'];
  rental_room?: SaveForLaterType['rental_room'];
}
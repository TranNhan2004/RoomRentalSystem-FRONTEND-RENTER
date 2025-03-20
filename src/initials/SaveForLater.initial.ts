import { SaveForLaterQueryType, SaveForLaterType } from "@/types/SaveForLater.type";

export const INITIAL_SAVE_FOR_LATER: SaveForLaterType = {
  id: '',
  notes: '',
  rental_room: '',
  renter: '',
} as const;

export const INITIAL_SAVE_FOR_LATER_QUERY: SaveForLaterQueryType = {
  renter: '',
  rental_room: ''
} as const;
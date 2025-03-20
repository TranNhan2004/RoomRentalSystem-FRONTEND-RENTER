import { SearchRoomHistoryType } from "@/types/SearchRoomHistory.type";
import { ApiService } from "./Api.service";
import { UnknownQueryType } from "@/types/UnknownQuery.type";
import { decryptValue, encryptValue } from "@/lib/server/aesCrypto";

class SearchRoomHistoryService extends ApiService<SearchRoomHistoryType, UnknownQueryType> {
  constructor() {
    super('/app.search-room-history/search-room-histories');
  }
};

export const searchRoomHistoryService = new SearchRoomHistoryService();


export const setSearchToLocalStorage = async (roomId: string, myId: string) => {
  const searchRoomHistory = localStorage.getItem('srh');

  if (searchRoomHistory) {
    const parsedSearchRoomHistory = JSON.parse(await decryptValue(searchRoomHistory)) as SearchRoomHistoryType[];
    const item = parsedSearchRoomHistory.find(item => item.rental_room === roomId);

    if (item && item.weight) {
      item.weight += 1;
    } else {
      parsedSearchRoomHistory.push({ rental_room: roomId, renter: myId, weight: 1 });
    }

    localStorage.setItem('srh', await encryptValue(JSON.stringify(parsedSearchRoomHistory)));

  } else {
    localStorage.setItem('srh', await encryptValue(
      JSON.stringify([{ rental_room: roomId, renter: myId, weight: 1 }])
    ));
  }

};

export const getSearchFromLocalStorage = async (): Promise<SearchRoomHistoryType[]> => {
  const searchRoomHistory = localStorage.getItem('srh');
  if (searchRoomHistory) {
    return JSON.parse(await decryptValue(searchRoomHistory));
  } 

  return [];
}; 


export const removeSearchFromLocalStorage = async () => {
  localStorage.removeItem('srh');
};
import { RecommendationQueryType, RecommendationType } from "@/types/Recommendation.type";
import { ApiService } from "./Api.service";
import { decryptValue, encryptValue } from "@/lib/server/aesCrypto";

class RecommendationService extends ApiService<RecommendationType, RecommendationQueryType> {
  constructor() {
    super('/app.recommendation/get-recommendations');
  }
};

export const searchRoomHistoryService = new RecommendationService();


export const setRecommendationToLocalStorage = async (data: RecommendationType[]) => {
  localStorage.setItem('rec', await encryptValue(JSON.stringify(data)));
};

export const getRecommendationFromLocalStorage = async (): Promise<RecommendationType[]> => {
  const recommendationData = localStorage.getItem('rec');
  if (recommendationData) {
    return JSON.parse(await decryptValue(recommendationData));
  } 

  return [];
}; 

export const removeRecommendationFromLocalStorage = async () => {
  localStorage.removeItem('rec');
};
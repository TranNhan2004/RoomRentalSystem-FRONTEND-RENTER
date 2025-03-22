import { RecommendationQueryType, RecommendationType } from "@/types/Recommendation.type";
import { ApiService } from "./Api.service";
import { decryptValue, encryptValue } from "@/lib/server/aesCrypto";

class RecommendationService extends ApiService<RecommendationType, RecommendationQueryType> {
  constructor() {
    super('/app.recommendation/get-recommendations');
  }
};

export const recommendationService = new RecommendationService();

type StoredRecommendationData = {
  data: RecommendationType[];
  expires: string; 
}

export const setRecommendationToLocalStorage = async (data: RecommendationType[]): Promise<void> => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 1); 

  const storedData: StoredRecommendationData = {
    data: data,
    expires: expires.toISOString(), 
  };

  const encryptedValue = await encryptValue(JSON.stringify(storedData));
  localStorage.setItem('rec', encryptedValue);
};

export const getRecommendationFromLocalStorage = async (): Promise<RecommendationType[]> => {
  const fullData = localStorage.getItem('rec');
  
  if (!fullData) {
    return [];
  }

  const decryptedValue = await decryptValue(fullData);
  const parsedFullData: StoredRecommendationData = JSON.parse(decryptedValue);

  const expiresDate = new Date(parsedFullData.expires);
  if (expiresDate <= new Date()) {
    localStorage.removeItem('rec');
    return [];
  }

  return parsedFullData.data;
};
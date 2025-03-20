import { DistanceQueryType, DistanceType } from "@/types/Distance.type";
import { ApiService } from "./Api.service";

export class DistanceService extends ApiService<DistanceType, DistanceQueryType> {
  constructor() {
    super('/app.distance/distances');
  }
}

export const distanceService = new DistanceService();
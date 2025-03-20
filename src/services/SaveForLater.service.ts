import { SaveForLaterQueryType, SaveForLaterType } from "@/types/SaveForLater.type";
import { ApiService } from "./Api.service";

class SaveForLaterService extends ApiService<SaveForLaterType, SaveForLaterQueryType> {
  constructor() {
    super('/app.save-for-later/save-for-later');
  }
};

export const saveForLaterService = new SaveForLaterService();
import { BigNumber } from "ethers";
import { File } from "./File.type";
export interface AddCampaignPayload {
  _name: string;
  _description: string;
  _categoryId: number;
  _imageHash: string;
  _goalAmount: BigNumber;
  _deadline: number;
  _files: File[];
}

import { File } from "./File.type";
export interface AddCampaignPayload {
  _name: string;
  _description: string;
  _imageHash: string;
  _goalAmount: number;
  _deadline: number;
  _files: File[];
}

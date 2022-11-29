import { CampaignApprovalStatus } from "./CampaignApprovalStatus.type";
import { CampaignStatus } from "./CampaignStatus.type";
export interface Campaign {
  id: number;
  name: string;
  description: string;
  imageHash: string;
  goalAmount: number;
  currentBalance: number;
  deadline: number;
  creator: string;
  campaignStatus: CampaignStatus;
  campaignApprovalStatus: CampaignApprovalStatus;
  status: boolean;
  timestamp: number;
}

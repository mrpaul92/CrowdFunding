import { EProductAvailability } from "./ProductAvailability.type";

export interface IProduct {
  nftId: number; // its the nft token id
  name: string;
  description: string;
  ipfsHash: string;
  availability: EProductAvailability;
  price: number;
  creator: string;
  owner: string;
  approved: boolean;
  rejected: boolean;
  status: boolean;
  timestamp: number;
}

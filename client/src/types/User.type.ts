import { EUserRole } from "./UserRole.type";

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: EUserRole;
  key: string;
  status: boolean;
  timestamp: number;
}

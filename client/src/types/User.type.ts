import { UserRole } from "./UserRole.type";
export interface User {
  id: number;
  name: string;
  email: string;
  key: string;
  role: UserRole;
  status: boolean;
  timestamp: number;
}

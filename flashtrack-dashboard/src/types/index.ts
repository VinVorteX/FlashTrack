export type UserRole = "user" | "admin" | "staff";
export type ComplaintStatus = "pending" | "in-progress" | "resolved";

export interface User {
  ID: number;
  Name: string;
  Email: string;
  Role: UserRole;
  SocietyID: number;
  SocietyName?: string;
}

export interface Complaint {
  id?: number;
  ID?: number;
  title?: string;
  Title?: string;
  description?: string;
  Description?: string;
  status?: ComplaintStatus;
  Status?: ComplaintStatus;
  resident_id?: number;
  ResidentID?: number;
  resident_name?: string;
  ResidentName?: string;
  staff_id?: number | null;
  StaffID?: number | null;
  staff_name?: string | null;
  StaffName?: string | null;
  society_id?: number;
  SocietyID?: number;
  category_id?: number;
  CategoryID?: number;
  category_name?: string;
  CategoryName?: string;
  created_at?: string;
  CreatedAt?: string;
  updated_at?: string;
  UpdatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  society_id: number;
}

export interface AuthResponse {
  token: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    society_id: number;
    society_name?: string;
  };
}

export interface Category {
  id: number;
  name: string;
}

export const CATEGORIES: Category[] = [
  { id: 1, name: "Plumbing" },
  { id: 2, name: "Electrical" },
  { id: 3, name: "Maintenance" },
  { id: 4, name: "Security" },
];

export const SOCIETIES = [
  { id: 1, name: "Green Valley Society" },
  { id: 2, name: "Sunrise Apartments" },
  { id: 3, name: "Palm Heights" },
  { id: 4, name: "Ocean View Residency" },
];

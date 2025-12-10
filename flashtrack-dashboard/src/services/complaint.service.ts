import api from "./api";
import type { Complaint } from "@/types";

export const complaintService = {
  async create(data: {
    title: string;
    description: string;
    category_id: number;
  }): Promise<Complaint> {
    const response = await api.post<Complaint>("/api/complaints", data);
    return response.data;
  },

  async getAll(): Promise<Complaint[]> {
    const response = await api.get<Complaint[]>("/api/complaints");
    // Ensure we always return an array, even if API returns error object
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  async assignStaff(complaintId: number, staffId: number): Promise<void> {
    await api.put("/api/admin/assign", {
      complaint_id: complaintId,
      staff_id: staffId,
    });
  },

  async resolve(complaintId: number): Promise<void> {
    await api.put(`/api/staff/resolve/${complaintId}`);
  },
};

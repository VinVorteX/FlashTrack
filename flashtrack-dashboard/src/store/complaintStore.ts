import { create } from "zustand";
import type { Complaint, ComplaintStatus } from "@/types";

interface ComplaintState {
  complaints: Complaint[];
  filter: ComplaintStatus | "all";
  searchQuery: string;
  setComplaints: (complaints: Complaint[]) => void;
  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (id: number, updates: Partial<Complaint>) => void;
  setFilter: (filter: ComplaintStatus | "all") => void;
  setSearchQuery: (query: string) => void;
  getFilteredComplaints: () => Complaint[];
}

export const useComplaintStore = create<ComplaintState>((set, get) => ({
  complaints: [],
  filter: "all",
  searchQuery: "",
  setComplaints: (complaints) =>
    set({ complaints: Array.isArray(complaints) ? complaints : [] }),
  addComplaint: (complaint) =>
    set((state) => ({
      complaints: [complaint, ...state.complaints],
    })),
  updateComplaint: (id, updates) =>
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.ID === id ? { ...c, ...updates } : c
      ),
    })),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  getFilteredComplaints: () => {
    const { complaints, filter, searchQuery } = get();
    const safeComplaints = complaints || [];
    return safeComplaints.filter((c) => {
      const status = c.status || c.Status || 'pending';
      const title = c.title || c.Title || '';
      const matchesFilter = filter === "all" || status === filter;
      const matchesSearch = !searchQuery || title.toLowerCase().includes(
        searchQuery.toLowerCase()
      );
      return matchesFilter && matchesSearch;
    });
  },
}));

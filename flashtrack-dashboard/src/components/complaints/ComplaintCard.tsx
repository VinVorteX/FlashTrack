import type { Complaint } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Calendar, User, Folder, UserCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface ComplaintCardProps {
  complaint: Complaint;
  onClick?: () => void;
  onAssignStaff?: (complaintId: number, staffId: number) => void;
  onResolve?: (complaintId: number) => void;
  staffMembers?: Array<{ id: number; name: string }>;
  isAssigning?: boolean;
  isResolving?: boolean;
}

export const ComplaintCard = ({ 
  complaint, 
  onClick, 
  onAssignStaff,
  onResolve,
  staffMembers = [], 
  isAssigning = false,
  isResolving = false
}: ComplaintCardProps) => {
  const { user } = useAuthStore();
  const isAdmin = user?.Role === 'admin';
  const isStaff = user?.Role === 'staff';
  
  const id = complaint.id || complaint.ID;
  const title = complaint.title || complaint.Title || 'Untitled';
  const description = complaint.description || complaint.Description || 'No description';
  const status = complaint.status || complaint.Status || 'pending';
  const categoryName = complaint.category_name || complaint.CategoryName || 'General';
  const residentName = complaint.resident_name || complaint.ResidentName;
  const residentId = complaint.resident_id || complaint.ResidentID;
  const staffName = complaint.staff_name || complaint.StaffName;
  const staffId = complaint.staff_id || complaint.StaffID;
  const createdAt = complaint.created_at || complaint.CreatedAt;

  return (
    <div
      onClick={onClick}
      className="group bg-card border border-border rounded-xl p-5 shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer animate-slide-up"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5" />
            <span>{categoryName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{residentName || `ID: ${residentId}`}</span>
          </div>
          {staffName && (
            <div className="flex items-center gap-1.5 text-primary">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assigned: {staffName}</span>
            </div>
          )}
          {createdAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {isAdmin && !staffId && onAssignStaff && staffMembers.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Assign to:</span>
            <select
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                if (e.target.value && id) {
                  onAssignStaff(id, parseInt(e.target.value));
                }
              }}
              disabled={isAssigning}
              className="text-xs px-2 py-1 rounded border border-border bg-background hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <option value="">Select staff...</option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {isStaff && staffId === user?.ID && status !== 'resolved' && onResolve && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (id) onResolve(id);
              }}
              disabled={isResolving}
              className="text-xs px-3 py-1.5 rounded bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20 transition-colors disabled:opacity-50 font-medium"
            >
              {isResolving ? 'Resolving...' : '✓ Mark as Resolved'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

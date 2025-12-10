import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useComplaintStore } from "@/store/complaintStore";
import { complaintService } from "@/services/complaint.service";
import { toast } from "sonner";
import { Search, UserPlus, Shield, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/types";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
}

const AdminPanel = () => {
  const { complaints, setComplaints, updateComplaint } = useComplaintStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsData, staffData] = await Promise.all([
          complaintService.getAll(),
          fetch('http://localhost:8081/api/staff', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('flashtrack_token')}`
            }
          }).then(r => r.json()).catch(() => [])
        ]);
        setComplaints(complaintsData || []);
        setStaffMembers(Array.isArray(staffData) ? staffData : []);
      } catch (error) {
        setComplaints([]);
        setStaffMembers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [setComplaints]);

  const handleAssignStaff = async (complaintId: number, staffId: string) => {
    setAssigningId(complaintId);
    try {
      await complaintService.assignStaff(complaintId, parseInt(staffId));
      updateComplaint(complaintId, {
        staff_id: parseInt(staffId),
        StaffID: parseInt(staffId),
        status: "in-progress",
        Status: "in-progress",
      });
      toast.success("Staff assigned successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to assign staff");
    } finally {
      setAssigningId(null);
    }
  };

  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const filteredComplaints = safeComplaints.filter((c) => {
    const title = c.title || c.Title || '';
    return !searchQuery || title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage complaints and assign staff
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search complaints..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredComplaints.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((complaint) => {
                  const id = complaint.id || complaint.ID;
                  const title = complaint.title || complaint.Title || 'Untitled';
                  const description = complaint.description || complaint.Description || '';
                  const status = complaint.status || complaint.Status || 'pending';
                  const categoryId = complaint.category_id || complaint.CategoryID;
                  const category = CATEGORIES.find((c) => c.id === categoryId);
                  const staffId = complaint.staff_id || complaint.StaffID;
                  const assignedStaff = staffMembers.find((s) => s.id === staffId);

                  return (
                    <TableRow key={id}>
                      <TableCell className="font-medium">
                        #{id}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">
                            {title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{category?.name || "General"}</TableCell>
                      <TableCell>
                        <StatusBadge status={status} />
                      </TableCell>
                      <TableCell>
                        {assignedStaff ? (
                          <span className="text-sm">{assignedStaff.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Select
                            onValueChange={(value) =>
                              handleAssignStaff(id!, value)
                            }
                            disabled={assigningId === id}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Assign Staff" />
                            </SelectTrigger>
                            <SelectContent>
                              {staffMembers.length > 0 ? (
                                staffMembers.map((staff) => (
                                  <SelectItem
                                    key={staff.id}
                                    value={staff.id.toString()}
                                  >
                                    {staff.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="0" disabled>
                                  No staff available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {assigningId === id && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <UserPlus className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No complaints to manage
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminPanel;

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import { ComplaintCard } from "@/components/complaints/ComplaintCard";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { useComplaintStore } from "@/store/complaintStore";
import { complaintService } from "@/services/complaint.service";
import api from "@/services/api";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import type { ComplaintStatus } from "@/types";

const Dashboard = () => {
  const { user } = useAuthStore();
  const { complaints, setComplaints, updateComplaint } = useComplaintStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState<Array<{ id: number; name: string }>>([]);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  const [feedbackComplaint, setFeedbackComplaint] = useState<any>(null);
  const [staffPoints, setStaffPoints] = useState<{total_points: number; tasks_completed: number} | null>(null);
  const isAdmin = user?.Role === 'admin';
  const isStaff = user?.Role === 'staff';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const complaintsData = await complaintService.getAll();
        setComplaints(complaintsData || []);
        
        if (isAdmin) {
          const staffData = await api.get('/api/staff').then(r => r.data).catch(() => []);
          setStaffMembers(Array.isArray(staffData) ? staffData : []);
        }

        if (isStaff) {
          const pointsData = await api.get('/api/staff/points').then(r => r.data).catch(() => null);
          setStaffPoints(pointsData);
        }

        // Check for resolved complaints needing feedback (users only)
        if (user?.Role === 'user') {
          // Get resolved complaints by this user
          const resolved = complaintsData.filter((c: any) => {
            const status = c.status || c.Status;
            const residentId = c.resident_id || c.ResidentID;
            return status === 'resolved' && residentId === user.ID;
          });
          
          if (resolved.length > 0) {
            // Check which ones don't have feedback yet
            try {
              const feedbackResponse = await api.post('/api/feedback/check', {
                complaint_ids: resolved.map((c: any) => c.id || c.ID)
              }).then(r => r.data).catch(() => ({ pending: [] }));
              
              const pendingIds = feedbackResponse.pending || [];
              const needsFeedback = resolved.find((c: any) => 
                pendingIds.includes(c.id || c.ID)
              );
              
              if (needsFeedback) {
                setFeedbackComplaint(needsFeedback);
              }
            } catch (error) {
              // Fallback: show first resolved complaint
              setFeedbackComplaint(resolved[0]);
            }
          }
        }
      } catch (error) {
        setComplaints([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [setComplaints, isAdmin, isStaff, user?.Role]);

  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  const stats = {
    total: safeComplaints.length,
    pending: safeComplaints.filter((c) => {
      const status = c.status || c.Status;
      return status === "pending";
    }).length,
    inProgress: safeComplaints.filter((c) => {
      const status = c.status || c.Status;
      return status === "in-progress";
    }).length,
    resolved: safeComplaints.filter((c) => {
      const status = c.status || c.Status;
      return status === "resolved";
    }).length,
  };

  const filteredComplaints = safeComplaints.filter((c) => {
    const title = c.title || c.Title || '';
    const status = c.status || c.Status || 'pending';
    const matchesSearch = !searchQuery || title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleAssignStaff = async (complaintId: number, staffId: number) => {
    setAssigningId(complaintId);
    try {
      await complaintService.assignStaff(complaintId, staffId);
      toast.success("Staff assigned successfully");
      // Refresh complaints to ensure stats update
      const complaintsData = await complaintService.getAll();
      setComplaints(complaintsData || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to assign staff");
    } finally {
      setAssigningId(null);
    }
  };

  const handleResolve = async (complaintId: number) => {
    setResolvingId(complaintId);
    try {
      await complaintService.resolve(complaintId);
      toast.success("Complaint marked as resolved");
      // Refresh complaints to get updated data
      const complaintsData = await complaintService.getAll();
      setComplaints(complaintsData || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to resolve complaint");
    } finally {
      setResolvingId(null);
    }
  };

  const handleFeedbackSubmitted = async () => {
    // Refresh complaints after feedback is submitted
    try {
      const complaintsData = await complaintService.getAll();
      setComplaints(complaintsData || []);
      setFeedbackComplaint(null);
      
      // Refresh staff points if user is staff
      if (isStaff) {
        const pointsData = await api.get('/api/staff/points').then(r => r.data).catch(() => null);
        setStaffPoints(pointsData);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.Name?.split(" ")[0] || "User"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.Role === 'admin' 
                ? "Manage and assign complaints to staff members"
                : user?.Role === 'staff'
                ? "View and manage your assigned complaints"
                : "Here's an overview of your complaint status"
              }
            </p>
          </div>
          {user?.Role === 'user' && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  New Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit a Complaint</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to submit your complaint
                  </DialogDescription>
                </DialogHeader>
                <ComplaintForm onSuccess={async () => {
                  setIsFormOpen(false);
                  const complaintsData = await complaintService.getAll();
                  setComplaints(complaintsData || []);
                }} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Staff Points Card */}
        {isStaff && staffPoints && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Your Reward Points</p>
                <p className="text-4xl font-bold mt-2">{staffPoints.total_points}</p>
                <p className="text-xs opacity-75 mt-1">{staffPoints.tasks_completed} tasks completed</p>
              </div>
              <div className="text-6xl">🏆</div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Complaints"
            value={stats.total}
            icon={ClipboardList}
            variant="primary"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={AlertCircle}
            variant="default"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={CheckCircle}
            variant="success"
          />
        </div> */}

        {/* Search & Filter */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ComplaintStatus | 'all')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* All Complaints */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              {user?.Role === 'admin' ? 'All Complaints' : 'Your Complaints'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user?.Role === 'admin' ? 'Manage and assign complaints' : 'Your submitted issues'}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-muted animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : filteredComplaints.length > 0 ? (
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => {
                const id = complaint.id || complaint.ID;
                return (
                  <ComplaintCard 
                    key={id} 
                    complaint={complaint}
                    onAssignStaff={handleAssignStaff}
                    onResolve={handleResolve}
                    staffMembers={staffMembers}
                    isAssigning={assigningId === id}
                    isResolving={resolvingId === id}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {searchQuery || statusFilter !== 'all' ? 'No complaints found' : 'No complaints yet'}
              </p>
              <p className="text-sm text-muted-foreground/75">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Click "New Complaint" to submit your first issue'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackComplaint && (
        <FeedbackModal
          open={!!feedbackComplaint}
          onClose={handleFeedbackSubmitted}
          complaintId={feedbackComplaint.id || feedbackComplaint.ID}
          complaintTitle={feedbackComplaint.title || feedbackComplaint.Title}
          staffName={feedbackComplaint.staff_name || feedbackComplaint.StaffName || 'Staff'}
        />
      )}
    </AppLayout>
  );
};

export default Dashboard;

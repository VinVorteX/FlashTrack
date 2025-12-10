import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { ComplaintForm } from '@/components/complaints/ComplaintForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useComplaintStore } from '@/store/complaintStore';
import { complaintService } from '@/services/complaint.service';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Plus, Search, Filter, ClipboardList } from 'lucide-react';
import type { ComplaintStatus } from '@/types';

const Complaints = () => {
  const { user } = useAuthStore();
  const { 
    complaints, 
    setComplaints,
    updateComplaint,
    filter, 
    setFilter, 
    searchQuery, 
    setSearchQuery,
    getFilteredComplaints 
  } = useComplaintStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState<Array<{ id: number; name: string }>>([]);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const isAdmin = user?.Role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const complaintsData = await complaintService.getAll();
        setComplaints(complaintsData || []);
        
        if (isAdmin) {
          const staffData = await fetch('http://localhost:8081/api/staff', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('flashtrack_token')}` }
          }).then(r => r.json()).catch(() => []);
          setStaffMembers(Array.isArray(staffData) ? staffData : []);
        }
      } catch (error) {
        setComplaints([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [setComplaints, isAdmin]);

  const filteredComplaints = getFilteredComplaints();

  const handleAssignStaff = async (complaintId: number, staffId: number) => {
    setAssigningId(complaintId);
    try {
      await complaintService.assignStaff(complaintId, staffId);
      updateComplaint(complaintId, {
        staff_id: staffId,
        StaffID: staffId,
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Complaints</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your complaints
            </p>
          </div>
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
              <ComplaintForm onSuccess={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
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
              <Select 
                value={filter} 
                onValueChange={(v) => setFilter(v as ComplaintStatus | 'all')}
              >
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

        {/* Complaints List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredComplaints.length > 0 ? (
          <div className="grid gap-4">
            {filteredComplaints.map((complaint) => {
              const id = complaint.id || complaint.ID;
              return (
                <ComplaintCard 
                  key={id} 
                  complaint={complaint}
                  onAssignStaff={handleAssignStaff}
                  staffMembers={staffMembers}
                  isAssigning={assigningId === id}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-12 text-center shadow-soft">
            <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-foreground">No complaints found</p>
            <p className="text-muted-foreground mt-1">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Submit your first complaint to get started'
              }
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Complaints;

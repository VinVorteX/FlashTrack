import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  complaintId: number;
  complaintTitle: string;
  staffName: string;
}

export const FeedbackModal = ({
  open,
  onClose,
  complaintId,
  complaintTitle,
  staffName,
}: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/feedback", {
        complaint_id: complaintId,
        rating,
        comment,
      });
      toast.success("Thank you for your feedback!");
      // Reset form state
      setRating(0);
      setComment("");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal={true}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Task Completed! 🎉</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Your complaint has been resolved
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              "{complaintTitle}"
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">
              How would you rate {staffName}'s service?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {rating === 5 && "Excellent! ⭐ (+10 points to staff)"}
                {rating === 4 && "Very Good! 👍 (+8 points to staff)"}
                {rating === 3 && "Good 👌 (+6 points to staff)"}
                {rating === 2 && "Fair 😐 (+4 points to staff)"}
                {rating === 1 && "Needs Improvement 😕 (+2 points to staff)"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Additional Comments (Optional)</p>
            <Textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
              ⚠️ Feedback is mandatory to complete the task verification process
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

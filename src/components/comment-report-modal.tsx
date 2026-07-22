import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface ReportModalProps {
  onSubmit: (reason: string, details: string) => void;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "offensive", label: "Offensive or Abusive" },
  { value: "harassment", label: "Harassment" },
  { value: "misinformation", label: "Misinformation" },
  { value: "off-topic", label: "Off-topic" },
  { value: "other", label: "Other" },
];

export default function ReportModal({ onSubmit, onClose }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!selectedReason.trim()) {
      setError("Please select a reason");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await onSubmit(selectedReason, details.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to report comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Report Comment</h2>
          <button
            onClick={onClose}
            className="rounded hover:bg-secondary"
            title="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Help us improve the community by reporting inappropriate content. Your
          report will be reviewed by our moderation team.
        </p>

        <div className="mt-4">
          <label className="text-sm font-semibold">Reason for reporting:</label>
          <div className="mt-2 space-y-2">
            {REPORT_REASONS.map((reason) => (
              <label key={reason.value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="report-reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="cursor-pointer"
                />
                <span className="text-sm">{reason.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="report-details" className="text-sm font-semibold">
            Additional details (optional):
          </label>
          <textarea
            id="report-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Provide any additional information..."
            maxLength={500}
            className="mt-2 h-20 w-full rounded border border-input bg-background p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {details.length}/500 characters
          </p>
        </div>

        {error && (
          <div className="mt-3 rounded bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </div>
    </div>
  );
}

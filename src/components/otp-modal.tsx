import { useState } from "react";
import { useUser } from "@/lib/authcontext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OtpModal() {
  const { otpPending, verifyOtpCode, cancelOtp } = useUser() as any;
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!otpPending) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    const result = await verifyOtpCode(code);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="text-lg font-bold">Verify your login</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {otpPending.message || "We sent a verification code to your email."}
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="text-center text-lg tracking-widest"
            autoFocus
          />

          {error && (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={cancelOtp}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
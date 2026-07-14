import { useState } from "react";
import { useUser } from "@/lib/authcontext";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosinstance";

const PLANS = [
  { name: "Free", price: 0, features: ["Standard video quality", "Ads included"] },
  { name: "Bronze", price: 199, features: ["No ads", "1 download/day"] },
  { name: "Silver", price: 499, features: ["No ads", "5 downloads/day", "HD quality"] },
  { name: "Gold", price: 799, features: ["No ads", "Unlimited downloads", "4K quality"] },
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SubscribePage() {
  const { user } = useUser() as { user: any };
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planName: string) => {
    console.log("current user:", user);
    if (!user?._id) {
      alert("Please sign in to upgrade your plan.");
      return;
    }

    setLoadingPlan(planName);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Check your connection.");
        setLoadingPlan(null);
        return;
      }

      const orderRes = await axiosInstance.post("/payment/create-order", {
        plan: planName,
      });
      const order = orderRes.data.result;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "YouTube 2.0",
        description: `Upgrade to ${planName} plan`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await axiosInstance.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id,
              plan: planName,
            });

            if (verifyRes.data.result) {
              alert(`Successfully upgraded to ${planName}!`);
              window.location.reload();
            }
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: { color: "#CC0000" },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <Sidebar />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Choose your plan</h1>
        <p className="text-muted-foreground mb-6">
          Current plan: <span className="font-semibold">{user?.plan || "Free"}</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-lg border p-5 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-bold">{plan.name}</h2>
                <p className="text-2xl font-bold mt-1">
                  {plan.price === 0 ? "Free" : `₹${plan.price}/mo`}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>

              <Button
                className="mt-4 w-full"
                disabled={plan.name === "Free" || user?.plan === plan.name || loadingPlan === plan.name}
                onClick={() => handleUpgrade(plan.name)}
              >
                {user?.plan === plan.name
                  ? "Current Plan"
                  : loadingPlan === plan.name
                  ? "Processing..."
                  : plan.name === "Free"
                  ? "Free Plan"
                  : "Upgrade"}
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useActor } from "./useActor";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}

export function useRazorpayCheckout() {
  const { actor } = useActor();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({
      amountInPaise,
    }: { keyId?: string; amountInPaise: number }) => {
      if (!actor) throw new Error("Actor not available");

      // Load Razorpay SDK dynamically
      await loadRazorpayScript();

      // Get Razorpay config to retrieve key
      const config = await actor.getRazorpayConfig();
      if (!config) throw new Error("Razorpay not configured");

      // Create order on backend (method may not exist yet — guarded)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actorAny = actor as any;
      if (typeof actorAny.createRazorpayOrder !== "function") {
        throw new Error(
          "Razorpay order creation is not yet available. Please contact support.",
        );
      }

      const orderResult = await actorAny.createRazorpayOrder(
        BigInt(amountInPaise),
      );
      const order = JSON.parse(orderResult) as {
        id: string;
        amount: number;
        currency: string;
      };

      if (!order?.id) throw new Error("Failed to create Razorpay order");

      // Open Razorpay checkout modal
      return new Promise<void>((resolve, reject) => {
        const options: RazorpayOptions = {
          key: config.keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Media Share",
          description: "Premium Monthly Subscription",
          order_id: order.id,
          handler: async (response: RazorpayPaymentResponse) => {
            try {
              if (!actor) throw new Error("Actor not available");
              if (typeof actorAny.verifyRazorpayPayment !== "function") {
                throw new Error("Payment verification not available.");
              }
              await actorAny.verifyRazorpayPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
              );
              resolve();
              navigate({ to: "/payment-success" });
            } catch (err) {
              reject(err);
              navigate({ to: "/payment-failure" });
            }
          },
          theme: { color: "#2563eb" },
          modal: {
            ondismiss: () => {
              reject(new Error("Payment dismissed"));
              navigate({ to: "/payment-failure" });
            },
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp: RazorpayInstance = new (window as any).Razorpay(options);
        rzp.open();
      });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.";
      if (message !== "Payment dismissed") {
        toast.error("Payment failed", { description: message });
      }
    },
  });
}

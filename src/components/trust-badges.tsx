import { Check, Shield, Flame, Award } from "lucide-react";

export function FreeCancellationBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
      <Check className="h-3.5 w-3.5" /> Free cancellation
    </span>
  );
}

export function BestSellerBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
      <Award className="h-3 w-3" /> Best Seller
    </span>
  );
}

export function LikelyToSellOutBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-100 px-2 py-0.5 text-xs font-bold text-red-600 uppercase tracking-wider">
      <Flame className="h-3 w-3" /> Likely to sell out
    </span>
  );
}

export function InstantConfirmationBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Check className="h-3.5 w-3.5" /> Instant confirmation
    </span>
  );
}

export function SecurePaymentBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
      <Shield className="h-4 w-4" /> Secure Payment
    </span>
  );
}

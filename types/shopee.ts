export type ShopeePointStatus =
  | "pending"
  | "auto_verified"
  | "approved"
  | "rejected"
  | "need_more_info"
  | "api_not_found"
  | "api_mismatch"
  | "duplicate";

export type ShopeeProcessingStatus = "pending" | "approved" | "rejected";

export type ShopeeVerificationStatus =
  | "not_checked"
  | "valid"
  | "manual_review"
  | "mismatch"
  | "not_found"
  | "duplicate"
  | "invalid_order_status";

export type ShopeeApiCheckStatus =
  | "not_checked"
  | "valid"
  | "manual_review"
  | "not_found"
  | "mismatch"
  | "duplicate";

export type ShopeeMemberTier = "Silver" | "Gold" | "Platinum";

export type ShopeeApiOrderStatus =
  | "COMPLETED"
  | "SHIPPED"
  | "CANCELLED"
  | "RETURNED"
  | "NOT_FOUND";

export type ShopeePointRequest = {
  id: string;
  customerName?: string;
  phone: string;
  email?: string;
  zalo?: string;
  isExistingCustomer?: boolean;
  memberTier?: ShopeeMemberTier;
  currentPoints?: number;
  shopeeOrderCode: string;
  customerInputAmount: number;
  orderImageUrl?: string;
  apiChecked: boolean;
  apiCheckStatus: ShopeeApiCheckStatus;
  apiOrderAmount?: number;
  apiOrderStatus?: string;
  apiShopId?: string;
  apiBuyerId?: string;
  apiCreateTime?: string;
  apiCompleteTime?: string;
  expectedPoints: number;
  approvedPoints?: number;
  status: ShopeePointStatus;
  processingStatus?: ShopeeProcessingStatus;
  verificationStatus?: ShopeeVerificationStatus;
  verificationIssues?: string[];
  matchedShopeeOrderId?: string;
  verifiedAt?: string;
  verificationNote?: string;
  adminNote?: string;
  rejectedReason?: string;
  source?: "customer_form" | "manual_admin" | "guest";
  receivedFrom?: "zalo" | "facebook" | "hotline" | "internal" | "other";
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
};

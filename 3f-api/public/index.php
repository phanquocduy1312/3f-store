<?php
/**
 * Mini MVC PHP Pure Backend - Entry Point
 */

date_default_timezone_set('Asia/Ho_Chi_Minh');

// Prevent raw PHP HTML errors from leaking into JSON response
ini_set('display_errors', '0');
error_reporting(E_ALL);

set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return;
    }
    throw new \ErrorException($message, 0, $severity, $file, $line);
});

// Load environment variables from .env
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $val = trim($parts[1]);
            if (preg_match('/^"(.*)"$/', $val, $matches) || preg_match("/^'(.*)'$/", $val, $matches)) {
                $val = $matches[1];
            }
            $val = trim($val);
            putenv("{$key}={$val}");
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
        }
    }
}

// 1. Load CORS
require_once dirname(__DIR__) . '/app/Helpers/cors.php';

// 2. Simple Autoloader mapping App\... namespace to app/... directory
spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $relativeClass = substr($class, 4);
        $file = dirname(__DIR__) . '/app/' . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

use App\Core\Router;
use App\Core\Response;
use App\Controllers\ShopeeOrderScanController;
use App\Controllers\ShopeePointRequestController;
use App\Controllers\CustomerPointController;
use App\Controllers\ShopeeAuthController;
use App\Controllers\ShopeeVerifyController;
use App\Controllers\ShopeeGuestController;
use App\Controllers\LoyaltyController;
use App\Controllers\ProductController;
use App\Controllers\OrderController;
use App\Controllers\AdminAuthController;
use App\Controllers\AdminCustomerController;
use App\Controllers\CouponController;
use App\Controllers\CustomerAuthController;
use App\Controllers\CustomerProfileController;
use App\Controllers\CustomerAddressController;
use App\Controllers\CustomerOrderController;
use App\Controllers\CustomerClubController;
use App\Controllers\CustomerSecurityController;
use App\Controllers\CustomerPetController;
use App\Controllers\CustomerWishlistController;
use App\Controllers\AdminDashboardController;
use App\Controllers\BannerController;
use App\Controllers\BlogPostController;
use App\Controllers\WorkflowController;
use App\Controllers\AdminNotificationController;
use App\Controllers\ProductReviewController;
use App\Controllers\OrderShippingMethodController;
use App\Controllers\ContactController;


try {
    // 0. Pre-instantiate models to run database migrations outside of transactions
    new \App\Models\Customer();
    new \App\Models\ShopeePointRequest();
    new \App\Models\LoyaltyPointRuleModel();
    new \App\Models\LoyaltyRewardModel();
    new \App\Models\LoyaltyRewardRedemptionModel();
    new \App\Models\CustomerPointTransactionModel();
    new \App\Models\LoyaltyProductionModel();
    new \App\Models\Product();
    new \App\Models\Order();
    new \App\Models\Coupon();
    new \App\Models\AdminUser();
    new \App\Models\AdminSession();
    new \App\Models\AuditLog();
    new \App\Models\ShopeeTokenModel();
    new \App\Models\CustomerSession();
    new \App\Models\CustomerOtp();
    new \App\Models\CustomerWishlist();
    new \App\Models\Banner();
    new \App\Models\BlogPost();
    new \App\Models\AdminNotification();
    new \App\Models\ProductReview();
    new \App\Models\OrderShippingMethod();
    new \App\Models\ContactMessage();

    // 3. Initialize Router
    $router = new Router();

    // 4. Register Routes
    $router->post("/api/admin/auth/login", [AdminAuthController::class, "login"]);
    $router->post("/api/admin/auth/logout", [AdminAuthController::class, "logout"]);
    $router->get("/api/admin/auth/me", [AdminAuthController::class, "me"]);
    $router->post("/api/admin/auth/bootstrap", [AdminAuthController::class, "bootstrap"]);

    // Admin Dashboard Routes
    $router->get("/api/admin/dashboard/stats", [AdminDashboardController::class, "getStats"]);
    $router->get("/api/admin/dashboard/revenue-chart", [AdminDashboardController::class, "getRevenueChart"]);
    $router->get("/api/admin/dashboard/task-queue", [AdminDashboardController::class, "getTaskQueue"]);
    $router->get("/api/admin/dashboard/top-products", [AdminDashboardController::class, "getTopProducts"]);
    $router->get("/api/admin/dashboard/pet-needs", [AdminDashboardController::class, "getPetNeedsStats"]);

    // Admin Notifications Routes
    $router->get("/api/admin/notifications", [AdminNotificationController::class, "list"]);
    $router->get("/api/admin/notifications/unread-count", [AdminNotificationController::class, "unreadCount"]);
    $router->post("/api/admin/notifications/mark-read", [AdminNotificationController::class, "markRead"]);
    $router->post("/api/admin/notifications/delete", [AdminNotificationController::class, "delete"]);

    // Admin Customer Management Routes
    $router->get("/api/admin/customers", [AdminCustomerController::class, "list"]);
    $router->get("/api/admin/customers/export-csv", [AdminCustomerController::class, "exportCsv"]);
    $router->get("/api/admin/customers/:id", [AdminCustomerController::class, "getDetail"]);
    $router->put("/api/admin/customers/:id/status", [AdminCustomerController::class, "updateStatus"]);
    $router->get("/api/admin/customers/:id/orders", [AdminCustomerController::class, "getOrders"]);
    $router->get("/api/admin/customers/:id/points", [AdminCustomerController::class, "getPoints"]);
    $router->get("/api/admin/customers/:id/addresses", [AdminCustomerController::class, "getAddresses"]);
    $router->get("/api/admin/customers/:id/vouchers", [AdminCustomerController::class, "getVouchers"]);
    $router->get("/api/admin/customers/:id/pets", [AdminCustomerController::class, "getPets"]);
    $router->get("/api/admin/customers/:id/sessions", [AdminCustomerController::class, "getSessions"]);
    
    // Admin Customer Care (Phase 1.2) Routes
    $router->get("/api/admin/customers/:id/notes", [AdminCustomerController::class, "getNotes"]);
    $router->post("/api/admin/customers/:id/notes", [AdminCustomerController::class, "createNote"]);
    $router->delete("/api/admin/customers/:id/notes/:noteId", [AdminCustomerController::class, "deleteNote"]);
    $router->get("/api/admin/customers/:id/tags", [AdminCustomerController::class, "getTags"]);
    $router->post("/api/admin/customers/:id/tags", [AdminCustomerController::class, "assignTag"]);
    $router->delete("/api/admin/customers/:id/tags/:tagId", [AdminCustomerController::class, "removeTag"]);
    $router->post("/api/admin/customers/:id/adjust-points", [AdminCustomerController::class, "adjustPoints"]);
    $router->post("/api/admin/customers/:id/revoke-sessions", [AdminCustomerController::class, "revokeAllSessions"]);
    $router->get("/api/admin/customers/:id/timeline", [AdminCustomerController::class, "getTimeline"]);

    // Customer Auth Routes
    $router->post("/api/customer/auth/register-email", [CustomerAuthController::class, "registerEmail"]);
    $router->post("/api/customer/auth/verify-registration", [CustomerAuthController::class, "verifyRegistration"]);
    $router->post("/api/customer/auth/resend-registration-verification", [CustomerAuthController::class, "resendRegistrationVerification"]);
    $router->post("/api/customer/auth/login-password", [CustomerAuthController::class, "loginPassword"]);
    $router->post("/api/customer/auth/request-otp", [CustomerAuthController::class, "requestOtp"]);
    $router->post("/api/customer/auth/verify-otp", [CustomerAuthController::class, "verifyOtp"]);
    
    // Customer OTP Endpoints
    $router->post("/api/customer/otp/send", [\App\Controllers\OtpController::class, "send"]);
    $router->post("/api/customer/otp/verify", [\App\Controllers\OtpController::class, "verify"]);
    $router->post("/api/customer/auth/complete-phone-register", [CustomerAuthController::class, "completePhoneRegister"]);
    $router->get("/api/customer/auth/me", [CustomerAuthController::class, "me"]);
    $router->post("/api/customer/auth/logout", [CustomerAuthController::class, "logout"]);
    $router->post("/api/customer/auth/add-phone", [CustomerAuthController::class, "addPhone"]);
    $router->post("/api/customer/auth/verify-add-phone", [CustomerAuthController::class, "verifyAddPhone"]);

    // Customer Profile & Account Center Routes
    $router->get("/api/customer/profile", [CustomerProfileController::class, "getProfile"]);
    $router->patch("/api/customer/profile", [CustomerProfileController::class, "patchProfile"]);
    $router->post("/api/customer/profile/request-phone-change", [CustomerProfileController::class, "requestPhoneChange"]);
    $router->post("/api/customer/profile/verify-phone-change", [CustomerProfileController::class, "verifyPhoneChange"]);
    $router->post("/api/customer/profile/request-email-verification", [CustomerProfileController::class, "requestEmailVerification"]);
    $router->post("/api/customer/profile/verify-email", [CustomerProfileController::class, "verifyEmail"]);
    $router->post("/api/customer/profile/upload-avatar", [CustomerProfileController::class, "uploadAvatar"]);

    // Customer Wishlist Routes
    $router->get("/api/customer/wishlist", [CustomerWishlistController::class, "getWishlist"]);
    $router->post("/api/customer/wishlist/toggle", [CustomerWishlistController::class, "toggleWishlist"]);
    $router->post("/api/customer/wishlist/sync", [CustomerWishlistController::class, "syncWishlist"]);
    $router->get("/api/run-wishlist-migration", [CustomerWishlistController::class, "runWishlistMigration"]);
    $router->get("/api/run-workflow-migration", [WorkflowController::class, "runWorkflowMigration"]);

    // Customer Address Book Routes
    $router->get("/api/customer/addresses", [CustomerAddressController::class, "list"]);
    $router->post("/api/customer/addresses", [CustomerAddressController::class, "create"]);
    $router->patch("/api/customer/addresses/:id", [CustomerAddressController::class, "update"]);
    $router->delete("/api/customer/addresses/:id", [CustomerAddressController::class, "delete"]);
    $router->post("/api/customer/addresses/:id/default", [CustomerAddressController::class, "setDefault"]);

    // Customer Orders Routes
    $router->get("/api/customer/orders", [CustomerOrderController::class, "list"]);
    $router->get("/api/customer/orders/:orderCode", [CustomerOrderController::class, "detail"]);
    $router->post("/api/customer/orders/:orderCode/cancel", [CustomerOrderController::class, "cancel"]);
    $router->post("/api/customer/orders/:orderCode/reorder", [CustomerOrderController::class, "reorder"]);

    // Customer Club Loyalty & Vouchers Routes
    $router->get("/api/customer/club/summary", [CustomerClubController::class, "summary"]);
    $router->get("/api/customer/club/transactions", [CustomerClubController::class, "transactions"]);
    $router->get("/api/customer/club/shopee-requests", [CustomerClubController::class, "shopeeRequests"]);
    $router->post("/api/customer/club/shopee-requests", [CustomerClubController::class, "createShopeeRequest"]);
    $router->get("/api/customer/vouchers", [CustomerClubController::class, "vouchers"]);

    // Customer Security Routes
    $router->post("/api/customer/security/change-password", [CustomerSecurityController::class, "changePassword"]);
    $router->get("/api/customer/security/sessions", [CustomerSecurityController::class, "sessions"]);
    $router->delete("/api/customer/security/sessions/:id", [CustomerSecurityController::class, "revokeSession"]);
    $router->post("/api/customer/security/logout-all", [CustomerSecurityController::class, "logoutAll"]);

    // Customer Pets Routes
    $router->get("/api/customer/pets", [CustomerPetController::class, "list"]);
    $router->post("/api/customer/pets", [CustomerPetController::class, "create"]);
    $router->patch("/api/customer/pets/:id", [CustomerPetController::class, "update"]);
    $router->delete("/api/customer/pets/:id", [CustomerPetController::class, "delete"]);
    $router->post("/api/customer/pet-advisor/consult", [CustomerPetController::class, "consult"]);
    $router->get("/api/admin/pet-advisor/consultations", [CustomerPetController::class, "adminConsultations"]);
    $router->get("/api/admin/pet-advisor/consultations/detail", [CustomerPetController::class, "adminConsultationDetail"]);

    $router->post("/api/shopee/order-scan", [ShopeeOrderScanController::class, "scan"]);
    $router->post("/api/shopee/guest/request-otp", [ShopeeGuestController::class, "requestOtp"]);
    $router->post("/api/shopee/guest/verify-otp", [ShopeeGuestController::class, "verifyOtp"]);
    $router->post("/api/shopee/requests", [ShopeePointRequestController::class, "create"]);
    $router->get("/api/admin/shopee/requests", [ShopeePointRequestController::class, "list"]);
    $router->get("/api/admin/shopee/requests/detail", [ShopeePointRequestController::class, "detail"]);
    $router->post("/api/admin/shopee/requests/approve", [ShopeePointRequestController::class, "approve"]);
    $router->post("/api/admin/shopee/requests/reject", [ShopeePointRequestController::class, "reject"]);
    $router->post("/api/admin/shopee/requests/verify", [ShopeeVerifyController::class, "verify"]);
    $router->post("/api/admin/shopee/requests/verify-bulk", [ShopeeVerifyController::class, "verifyBulk"]);
    $router->get("/api/customer/points", [CustomerPointController::class, "points"]);

    // Order E-commerce Routes
    $router->post("/api/orders/create", [OrderController::class, "create"]);
    $router->post("/api/coupons/validate", [CouponController::class, "validate"]);
    $router->get("/api/vouchers/featured", [CouponController::class, "featured"]);
    $router->get("/api/vouchers/cart-suggestions", [CouponController::class, "cartSuggestions"]);
    $router->get("/api/vouchers/ai-advisor", [CouponController::class, "aiAdvisor"]);
    $router->post("/api/vouchers/track", [CouponController::class, "track"]);

    // Shipping Methods Routes
    $router->get("/api/order-shipping-methods", [OrderShippingMethodController::class, "publicList"]);
    $router->get("/api/admin/order-shipping-methods", [OrderShippingMethodController::class, "adminList"]);
    $router->post("/api/admin/order-shipping-methods/save", [OrderShippingMethodController::class, "adminSave"]);
    $router->post("/api/admin/order-shipping-methods/toggle", [OrderShippingMethodController::class, "adminToggle"]);
    $router->delete("/api/admin/order-shipping-methods/:id", [OrderShippingMethodController::class, "adminDelete"]);

    // Admin Voucher Routes
    $router->get("/api/admin/vouchers", [CouponController::class, "adminList"]);
    $router->get("/api/admin/vouchers/detail", [CouponController::class, "adminDetail"]);
    $router->post("/api/admin/vouchers", [CouponController::class, "adminSave"]);
    $router->post("/api/admin/vouchers/update", [CouponController::class, "adminSave"]);
    $router->post("/api/admin/vouchers/toggle-active", [CouponController::class, "adminToggleActive"]);
    $router->post("/api/admin/vouchers/delete", [CouponController::class, "adminDelete"]);
    $router->get("/api/admin/vouchers/stats", [CouponController::class, "adminStats"]);

    $router->get("/api/orders/detail", [OrderController::class, "detail"]);
    $router->get("/api/orders/check", [OrderController::class, "check"]);
    $router->get("/api/admin/orders", [OrderController::class, "adminList"]);
    $router->post("/api/admin/orders/update-status", [OrderController::class, "adminUpdateStatus"]);
    $router->post("/api/admin/orders/mark-paid", [OrderController::class, "adminMarkPaid"]);
    $router->get("/api/admin/orders/:id/allowed-transitions", [WorkflowController::class, "orderAllowedTransitions"]);
    $router->get("/api/admin/orders/status-config", [WorkflowController::class, "getOrderStatusConfig"]);
    $router->put("/api/admin/orders/status-config/statuses/:id", [WorkflowController::class, "updateOrderStatusConfig"]);
    $router->put("/api/admin/orders/status-config/transitions/:id", [WorkflowController::class, "updateOrderTransitionConfig"]);

    // Workflow Configuration Settings Routes
    $router->get("/api/admin/workflows/statuses", [WorkflowController::class, "listStatuses"]);
    $router->post("/api/admin/workflows/statuses/save", [WorkflowController::class, "saveStatus"]);
    $router->post("/api/admin/workflows/statuses/delete", [WorkflowController::class, "deleteStatus"]);
    $router->get("/api/admin/workflows/transitions", [WorkflowController::class, "listTransitions"]);
    $router->post("/api/admin/workflows/transitions/save", [WorkflowController::class, "saveTransition"]);
    $router->post("/api/admin/workflows/transitions/delete", [WorkflowController::class, "deleteTransition"]);
    $router->get("/api/admin/workflows/automation-rules", [WorkflowController::class, "listAutomationRules"]);
    $router->post("/api/admin/workflows/automation-rules/save", [WorkflowController::class, "saveAutomationRule"]);
    $router->post("/api/admin/workflows/automation-rules/delete", [WorkflowController::class, "deleteAutomationRule"]);
    $router->get("/api/admin/workflows/shipping-providers", [WorkflowController::class, "listShippingProviders"]);
    $router->post("/api/admin/workflows/shipping-providers/save", [WorkflowController::class, "saveShippingProvider"]);
    $router->post("/api/admin/workflows/shipping-providers/delete", [WorkflowController::class, "deleteShippingProvider"]);
    $router->get("/api/admin/workflows/notification-channels", [WorkflowController::class, "listNotificationChannels"]);
    $router->post("/api/admin/workflows/notification-channels/save", [WorkflowController::class, "saveNotificationChannel"]);
    $router->post("/api/admin/workflows/notification-channels/delete", [WorkflowController::class, "deleteNotificationChannel"]);


    // Product Catalog Routes
    $router->get("/api/products", [ProductController::class, "list"]);
    $router->get("/api/products/detail", [ProductController::class, "detail"]);
    $router->get("/api/products/filters", [ProductController::class, "filters"]);
    $router->get("/api/product-categories", [ProductController::class, "categories"]);
    $router->get("/api/admin/products", [ProductController::class, "adminList"]);
    $router->get("/api/admin/products/detail", [ProductController::class, "adminDetail"]);
    $router->post("/api/admin/products/save", [ProductController::class, "adminSave"]);
    $router->delete("/api/admin/products/:id", [ProductController::class, "adminDelete"]);
    $router->post("/api/admin/products/toggle-active", [ProductController::class, "adminToggleActive"]);
    $router->post("/api/admin/products/upload-image", [ProductController::class, "adminUploadImage"]);
    $router->post("/api/admin/products/reclassify", [ProductController::class, "adminReclassify"]);

    // Product Reviews Routes
    $router->get("/api/products/reviews", [ProductReviewController::class, "list"]);
    $router->get("/api/products/review-eligibility", [ProductReviewController::class, "eligibility"]);
    $router->post("/api/products/reviews", [ProductReviewController::class, "create"]);
    $router->get("/api/admin/product-reviews", [ProductReviewController::class, "adminList"]);
    $router->get("/api/admin/product-reviews/detail", [ProductReviewController::class, "adminDetail"]);
    $router->put("/api/admin/product-reviews/:id/status", [ProductReviewController::class, "adminUpdateStatus"]);
    $router->delete("/api/admin/product-reviews/:id", [ProductReviewController::class, "adminDelete"]);

    // Admin Category Routes
    $router->get("/api/admin/categories", [ProductController::class, "adminCategoryList"]);
    $router->post("/api/admin/categories/save", [ProductController::class, "adminCategorySave"]);
    $router->post("/api/admin/categories/toggle-active", [ProductController::class, "adminCategoryToggleActive"]);
    $router->delete("/api/admin/categories/:id", [ProductController::class, "adminCategoryDelete"]);

    // Banners Routes
    $router->get("/api/banners", [BannerController::class, "getActiveBanners"]);
    $router->post("/api/banners/:id/click", [BannerController::class, "trackClick"]);
    $router->post("/api/banners/:id/impression", [BannerController::class, "trackImpression"]);
    $router->get("/api/admin/banners", [BannerController::class, "adminList"]);
    $router->post("/api/admin/banners/upload-image", [BannerController::class, "adminUploadImage"]);
    $router->get("/api/admin/banners/:id", [BannerController::class, "adminDetail"]);
    $router->post("/api/admin/banners", [BannerController::class, "adminCreate"]);
    $router->put("/api/admin/banners/:id", [BannerController::class, "adminUpdate"]);
    $router->delete("/api/admin/banners/:id", [BannerController::class, "adminDelete"]);

    // Blog Posts Routes
    $router->get("/api/blog-posts", [BlogPostController::class, "getList"]);
    $router->get("/api/blog-posts/:slug", [BlogPostController::class, "getDetail"]);
    $router->get("/api/admin/blog-posts/crawl", [BlogPostController::class, "adminCrawl"]);
    $router->get("/api/admin/blog-posts/:id", [BlogPostController::class, "adminGetDetail"]);
    $router->post("/api/admin/blog-posts", [BlogPostController::class, "adminCreate"]);
    $router->put("/api/admin/blog-posts/:id", [BlogPostController::class, "adminUpdate"]);
    $router->delete("/api/admin/blog-posts/:id", [BlogPostController::class, "adminDelete"]);
    $router->post("/api/admin/blog-posts/upload", [BlogPostController::class, "adminUploadImage"]);

    // Shopee OAuth Sandbox Routes
    $router->get("/api/admin/shopee/auth-url", [ShopeeAuthController::class, "getAuthUrl"]);
    $router->get("/api/admin/shopee/connect", [ShopeeAuthController::class, "connect"]);
    $router->get("/api/shopee/callback", [ShopeeAuthController::class, "callback"]);
    $router->get("/api/shopee/callback/", [ShopeeAuthController::class, "callback"]);
    $router->get("/api/admin/shopee/connection-status", [ShopeeAuthController::class, "connectionStatus"]);

    // Loyalty Rule Config Routes
    $router->get("/api/admin/loyalty/settings", [LoyaltyController::class, "getSettings"]);
    $router->post("/api/admin/loyalty/settings", [LoyaltyController::class, "saveSettings"]);
    $router->get("/api/admin/3f-club/settings", [LoyaltyController::class, "getSettings"]);
    $router->put("/api/admin/3f-club/settings", [LoyaltyController::class, "saveSettings"]);
    $router->post("/api/admin/3f-club/settings", [LoyaltyController::class, "saveSettings"]);
    $router->get("/api/admin/loyalty/point-rules", [LoyaltyController::class, "list"]);
    $router->post("/api/admin/loyalty/point-rules", [LoyaltyController::class, "create"]);
    $router->post("/api/admin/loyalty/point-rules/update", [LoyaltyController::class, "update"]);
    $router->post("/api/admin/loyalty/point-rules/deactivate", [LoyaltyController::class, "deactivate"]);
    $router->post("/api/admin/loyalty/calculate-preview", [LoyaltyController::class, "calculatePreview"]);

    // Loyalty Rewards & Redemptions Routes
    $router->get("/api/admin/loyalty/rewards", [LoyaltyController::class, "listRewards"]);
    $router->get("/api/admin/loyalty/rewards/detail", [LoyaltyController::class, "rewardDetail"]);
    $router->post("/api/admin/loyalty/rewards", [LoyaltyController::class, "createReward"]);
    $router->post("/api/admin/loyalty/rewards/upload-image", [LoyaltyController::class, "uploadRewardImage"]);
    $router->post("/api/admin/loyalty/rewards/update", [LoyaltyController::class, "updateReward"]);
    $router->post("/api/admin/loyalty/rewards/deactivate", [LoyaltyController::class, "deactivateReward"]);
    $router->post("/api/admin/loyalty/rewards/toggle-active", [LoyaltyController::class, "toggleRewardActive"]);
    $router->post("/api/admin/loyalty/rewards/import-vouchers", [LoyaltyController::class, "importRewardVouchers"]);
    $router->get("/api/admin/loyalty/rewards/vouchers", [LoyaltyController::class, "listRewardVouchers"]);
    $router->get("/api/loyalty/rewards", [LoyaltyController::class, "listActiveRewards"]);
    $router->post("/api/loyalty/rewards/redeem", [LoyaltyController::class, "redeem"]);
    $router->get("/api/admin/loyalty/redemptions", [LoyaltyController::class, "listRedemptions"]);
    $router->post("/api/admin/loyalty/redemptions/approve", [LoyaltyController::class, "approveRedemption"]);
    $router->post("/api/admin/loyalty/redemptions/reject", [LoyaltyController::class, "rejectRedemption"]);
    $router->post("/api/admin/loyalty/redemptions/fulfill", [LoyaltyController::class, "fulfillRedemption"]);
    $router->get("/api/admin/loyalty/transactions", [LoyaltyController::class, "listTransactionsAdmin"]);
    $router->get("/api/loyalty/transactions", [LoyaltyController::class, "listTransactionsClient"]);
    $router->get("/api/loyalty/tiers", [LoyaltyController::class, "listLoyaltyTiersPublic"]);
    $router->get("/api/loyalty/point-rules/shopee", [LoyaltyController::class, "getShopeePointRulePublic"]);
    $router->get("/api/admin/loyalty/voucher-pool", [LoyaltyController::class, "listVoucherPool"]);
    $router->post("/api/admin/loyalty/voucher-pool/import", [LoyaltyController::class, "importVoucherPool"]);
    $router->get("/api/admin/loyalty/tiers", [LoyaltyController::class, "listTiers"]);
    $router->post("/api/admin/loyalty/tiers/save", [LoyaltyController::class, "saveTier"]);
    $router->get("/api/admin/3f-club/tiers", [LoyaltyController::class, "listLoyaltyTiers"]);
    $router->put("/api/admin/3f-club/tiers/:id", [LoyaltyController::class, "updateLoyaltyTier"]);
    $router->post("/api/admin/3f-club/tiers/:id", [LoyaltyController::class, "updateLoyaltyTier"]);
    $router->post("/api/admin/loyalty/tiers/active", [LoyaltyController::class, "setTierActive"]);
    $router->get("/api/admin/loyalty/tiers/preview", [LoyaltyController::class, "previewTier"]);
    $router->get("/api/admin/loyalty/campaigns", [LoyaltyController::class, "listCampaigns"]);
    $router->post("/api/admin/loyalty/campaigns/save", [LoyaltyController::class, "saveCampaign"]);
    $router->post("/api/admin/loyalty/campaigns/active", [LoyaltyController::class, "setCampaignActive"]);
    $router->post("/api/admin/loyalty/preview-points", [LoyaltyController::class, "previewPointsProduction"]);
    $router->get("/api/admin/loyalty/analytics", [LoyaltyController::class, "analytics"]);
    $router->get("/api/admin/customers/loyalty", [LoyaltyController::class, "customerLoyaltyProfile"]);
    $router->get("/api/customer/tier", [LoyaltyController::class, "customerTier"]);
    $router->get("/api/customer/rewards/history", [LoyaltyController::class, "customerRewardHistory"]);
    $router->post("/api/contact", [ContactController::class, "submit"]);

    // 5. Dispatch Request
    $router->dispatch();

} catch (\Throwable $e) {
    // Fallback JSON error boundary to prevent leaking raw PHP logs
    $debug = (getenv('APP_DEBUG') === 'true' || getenv('APP_DEBUG') === '1');
    if ($debug) {
        Response::json([
            "success" => false,
            "message" => "Internal Server Error: " . $e->getMessage(),
            "trace" => $e->getTraceAsString()
        ], 500);
    } else {
        error_log("Exception in index.php: " . $e->getMessage() . "\n" . $e->getTraceAsString());
        Response::json([
            "success" => false,
            "message" => "Internal server error: " . $e->getMessage(),
            "trace" => $e->getTraceAsString()
        ], 500);
    }
}



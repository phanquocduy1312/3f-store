import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Coins,
  Gift,
  History,
  Settings,
  ShoppingBag,
  Ticket,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

import { LoyaltyRedemptionsSection } from "@/components/admin/loyalty/LoyaltyRedemptionsSection";
import { LoyaltyRewardsSection } from "@/components/admin/loyalty/LoyaltyRewardsSection";
import {
  LoyaltySettingsSection,
  type LoyaltyRule,
} from "@/components/admin/loyalty/LoyaltySettingsSection";
import { LoyaltyTransactionsSection } from "@/components/admin/loyalty/LoyaltyTransactionsSection";
import { MembershipTiersSection } from "@/components/admin/loyalty/MembershipTiersSection";
import { ShopeeRequestsSection } from "@/components/admin/shopee/ShopeeRequestsSection";
import { API_BASE_URL } from "@/src/config/api";
import { getAdminLoyaltyRedemptions } from "@/src/services/loyaltyRedemptionsApi";
import type { ShopeePointRequest } from "@/types/shopee";

type MainTab = "shopee" | "points" | "tiers" | "rewards" | "history";
type RewardsSubTab = "redemptions" | "catalog";

type ShopeeDateRange = "today" | "this_week" | "this_month" | "this_year" | "all_time" | "custom";
type DateRangeResult = {
  currentStart?: Date;
  currentEnd?: Date;
};

const mainTabs: Array<{ id: MainTab; label: string; icon: any }> = [
  { id: "shopee", label: "Đơn Shopee", icon: ShoppingBag },
  { id: "points", label: "Cấu Hình Điểm", icon: Coins },
  { id: "tiers", label: "Hạng thành viên", icon: Ticket },
  { id: "rewards", label: "Quà & Voucher", icon: Gift },
  { id: "history", label: "Lịch sử", icon: History },
];

export default function ThreeFClubPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth < 1024;
    return false;
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedDate, setSelectedDate] = useState("today");
  const [activeTab, setActiveTab] = useState<MainTab>("shopee");
  const [rewardsSubTab, setRewardsSubTab] = useState<RewardsSubTab>("catalog");

  const [requests, setRequests] = useState<ShopeePointRequest[]>([]);
  const [activeRule, setActiveRule] = useState<LoyaltyRule | null>(null);
  const [overview, setOverview] = useState({
    pendingRedemptions: 0,
    issuedPoints: 0,
    usedPoints: 0,
    lowVoucherRewards: 0,
    hasLoaded: false,
  });

  const loadOverview = async () => {
    try {
      const [shopee, rules, redemptions] = await Promise.all([
        fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/shopee/requests?limit=100`).catch(() => ({ data: [] })),
        fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/loyalty/point-rules`).catch(() => ({ data: [] })),
        getAdminLoyaltyRedemptions({ status: "pending" }).catch(() => ({ data: [] })),
      ]);

      const shopeeRows = (shopee.data || []).map((row: any) => ({
        id: String(row.id),
        processingStatus: row.processingStatus || "pending",
        verificationStatus: row.verificationStatus || "not_checked",
        createdAt: row.createdAt || "",
      })) as ShopeePointRequest[];
      setRequests((prev) => (prev.length > 0 ? prev : shopeeRows));

      const active = (rules.data || []).find(
        (rule: any) => Number(rule.isActive) === 1 && rule.source === "shopee",
      );
      if (active) setActiveRule(active);

      setOverview({
        pendingRedemptions: redemptions.data?.length || 0,
        issuedPoints: 0,
        usedPoints: 0,
        lowVoucherRewards: 0,
        hasLoaded: true,
      });
    } catch {
      setOverview((prev) => ({ ...prev, hasLoaded: true }));
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (overview.pendingRedemptions > 0) {
      setRewardsSubTab("redemptions");
    }
  }, [overview.pendingRedemptions]);

  const selectedRange = useMemo(
    () => getShopeeDateRange(selectedDate as ShopeeDateRange),
    [selectedDate],
  );

  const summaryRequests = useMemo(
    () => filterRequestsByDate(requests, selectedRange, "createdAt"),
    [requests, selectedRange],
  );

  const shopeeStats = useMemo(
    () => ({
      total: summaryRequests.length,
      pending: summaryRequests.filter((r) => r.processingStatus === "pending").length,
      valid: summaryRequests.filter((r) => r.verificationStatus === "valid").length,
      approved: summaryRequests.filter((r) => r.processingStatus === "approved").length,
    }),
    [summaryRequests],
  );

  const summaryCards = [
    {
      label: "Chờ duyệt Shopee",
      value: shopeeStats.pending,
      icon: ClipboardList,
      iconClassName: "bg-[#EEF4FF] text-[#0057E7]",
    },
    {
      label: "API hợp lệ",
      value: shopeeStats.valid,
      icon: CheckCircle2,
      iconClassName: "bg-[#ECFDF3] text-[#039855]",
    },
    {
      label: "Đổi quà chờ xử lý",
      value: overview.pendingRedemptions,
      icon: Gift,
      iconClassName: "bg-[#FFF4E8] text-[#F97316]",
    },
    {
      label: "Điểm đã phát hành",
      value: overview.issuedPoints,
      icon: Coins,
      iconClassName: "bg-[#F5F3FF] text-[#7C3AED]",
    },
    {
      label: "Điểm đã sử dụng",
      value: overview.usedPoints,
      icon: History,
      iconClassName: "bg-[#FFF1F3] text-[#E11D48]",
    },
    {
      label: "Quy đổi hiện tại",
      value: activeRule
        ? `${activeRule.moneyPerPoint.toLocaleString("vi-VN")}đ = 1 điểm`
        : "10.000đ = 1 điểm",
      icon: Settings,
      iconClassName: "bg-[#ECFEFF] text-[#0891B2]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAFF]">
      <AdminSidebar activeMenu="3F Club" setActiveMenu={() => undefined} collapsed={sidebarCollapsed} />

      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div className={`min-h-screen overflow-x-hidden ${sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"}`}>
        <AdminHeader
          onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <main className="space-y-5 px-4 py-4 sm:px-6 sm:py-6">
          <section className="flex flex-col gap-2">
            <h1 className="text-[30px] font-black text-[#0B1F3A]">3F Club</h1>
            <p className="text-[14px] font-semibold text-[#64748B]">
              Duyệt đơn Shopee, cấu hình điểm và xử lý đổi quà trong một luồng vận hành.
            </p>
          </section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {summaryCards.map((card) => (
              <SummaryCard key={card.label} {...card} />
            ))}
          </div>

          <nav className="sticky top-0 z-20 border-b border-[#DCEBFF] bg-[#F6FAFF]/95 pt-2 backdrop-blur">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex h-12 shrink-0 items-center gap-2 border-b-4 px-3 text-[14px] font-black transition ${
                      isActive ? "border-[#0057E7] text-[#0057E7]" : "border-transparent text-[#64748B] hover:text-[#0B1F3A]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {activeTab === "shopee" && (
            <ShopeeRequestsSection
              onRequestsLoaded={setRequests}
              searchValue={searchValue}
              selectedDate={selectedDate}
              hideTitle={true}
              hideStats={true}
            />
          )}

          {activeTab === "points" && (
            <GroupedPanel
              intro="Thiết lập cách quy đổi tiền thành điểm cho khách hàng khi tích điểm trong 3F Club."
              tabs={[{ id: "rules", label: "Quy đổi điểm" }]}
              active="rules"
              onChange={() => undefined}
            >
              <LoyaltySettingsSection onActiveRuleLoaded={setActiveRule} hideTitle={true} />
            </GroupedPanel>
          )}

          {activeTab === "tiers" && (
            <GroupedPanel
              intro="Quản lý các hạng thành viên và điều kiện nâng hạng trong 3F Club."
              tabs={[{ id: "tiers", label: "Hạng thành viên" }]}
              active="tiers"
              onChange={() => undefined}
            >
              <MembershipTiersSection />
            </GroupedPanel>
          )}

          {activeTab === "rewards" && (
            <GroupedPanel
              intro="Quản lý quà đổi điểm, voucher và các yêu cầu đổi quà của khách hàng."
              tabs={[
                { id: "catalog", label: "Danh sách quà" },
                { id: "redemptions", label: "Yêu cầu đổi quà" },
              ]}
              active={rewardsSubTab}
              onChange={(id) => setRewardsSubTab(id as RewardsSubTab)}
            >
              {rewardsSubTab === "catalog" && <LoyaltyRewardsSection />}
              {rewardsSubTab === "redemptions" && <LoyaltyRedemptionsSection />}
            </GroupedPanel>
          )}

          {activeTab === "history" && (
            <GroupedPanel
              intro="Tra cứu lịch sử điểm của khách hàng."
              tabs={[
                { id: "transactions", label: "Lịch sử điểm" },
              ]}
              active="transactions"
              onChange={() => undefined}
            >
              <LoyaltyTransactionsSection />
            </GroupedPanel>
          )}
        </main>
      </div>
    </div>
  );
}

async function fetchJsonWithTimeout(url: string) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data?.message || "Không tải được dữ liệu.");
    }

    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  iconClassName = "bg-[#EEF6FF] text-[#0057E7]",
}: {
  label: string;
  value: number | string;
  icon: any;
  iconClassName?: string;
}) {
  return (
    <div className="min-h-[96px] rounded-[20px] border border-[#DCEBFF] bg-white p-4 shadow-[0_8px_24px_rgba(6,43,95,0.05)]">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-bold text-[#64748B]">{label}</div>
          <div className="mt-1 truncate text-[20px] font-black text-[#0B1F3A]">
            {typeof value === "number" ? value.toLocaleString("vi-VN") : value || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupedPanel({
  intro,
  tabs,
  active,
  onChange,
  children,
}: {
  intro: string;
  tabs: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-[#DCEBFF] bg-white p-4">
        <p className="text-[13px] font-semibold text-[#64748B]">{intro}</p>
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`h-10 shrink-0 rounded-2xl px-4 text-[13px] font-black transition ${
                active === tab.id
                  ? "bg-[#0057E7] text-white"
                  : "border border-[#DCEBFF] bg-white text-[#64748B] hover:text-[#0B1F3A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>
      {children}
    </div>
  );
}

function getShopeeDateRange(range: ShopeeDateRange, now = new Date()): DateRangeResult {
  const currentEnd = now;

  if (range === "today") {
    return {
      currentStart: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      currentEnd,
    };
  }

  if (range === "this_week") {
    const day = now.getDay() || 7;
    return {
      currentStart: new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1),
      currentEnd,
    };
  }

  if (range === "this_month") {
    return {
      currentStart: new Date(now.getFullYear(), now.getMonth(), 1),
      currentEnd,
    };
  }

  if (range === "this_year") {
    return {
      currentStart: new Date(now.getFullYear(), 0, 1),
      currentEnd,
    };
  }

  return {};
}

function isDateInRange(dateValue?: string, start?: Date, end?: Date) {
  if (!dateValue) return false;
  if (!start || !end) return true;
  const date = new Date(dateValue).getTime();
  return date >= start.getTime() && date <= end.getTime();
}

function filterRequestsByDate(
  requests: ShopeePointRequest[],
  range: DateRangeResult,
  dateField: "createdAt" | "updatedAt" | "approvedAt",
) {
  if (!range.currentStart || !range.currentEnd) return requests;
  return requests.filter((request) => isDateInRange(request[dateField], range.currentStart, range.currentEnd));
}

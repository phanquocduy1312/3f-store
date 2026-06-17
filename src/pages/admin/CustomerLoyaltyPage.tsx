import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getCustomerLoyaltyProfile } from "@/src/services/loyaltyProductionApi";
import { useToast } from "@/components/ui/toast-notification";

export default function CustomerLoyaltyPage() {
  const { id = "" } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => typeof window !== "undefined" && window.innerWidth < 1024);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    getCustomerLoyaltyProfile(id)
      .then((res) => setData(res.data))
      .catch((err) => toast.error(err.message || "Không tải được hồ sơ loyalty."))
      .finally(() => setIsLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F6FAFF]">
      <AdminSidebar activeMenu="3F Club" setActiveMenu={() => undefined} collapsed={sidebarCollapsed} />
      <div className={`min-h-screen ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-[220px]"}`}>
        <AdminHeader onToggleSidebar={() => setSidebarCollapsed((v) => !v)} searchValue="" onSearchChange={() => undefined} selectedDate="today" onDateChange={() => undefined} />
        <main className="space-y-5 p-5">
          <h1 className="text-[28px] font-black text-[#0B1F3A]">Loyalty khách hàng {id}</h1>
          {isLoading || !data ? (
            <div className="rounded-[24px] bg-white p-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card label="Điểm hiện tại" value={data.availablePoints} />
                <Card label="Tổng điểm đã tích" value={data.totalEarnedPoints} />
                <Card label="Tổng điểm đã dùng" value={data.totalSpentPoints} />
                <Card label="Hạng thành viên" value={data.profile?.tier_name || "Silver"} />
              </div>

              <section className="rounded-[24px] border border-[#DCEBFF] bg-white p-5">
                <h2 className="font-black text-[#0B1F3A]">Biểu đồ tăng trưởng điểm</h2>
                <div className="mt-4 space-y-2">
                  {data.growth?.map((row: any) => (
                    <div key={row.date} className="grid grid-cols-[100px_1fr_80px] items-center gap-3 text-[12px] font-bold">
                      <span>{row.date}</span>
                      <div className="h-3 rounded-full bg-[#EEF6FF]"><div className="h-3 rounded-full bg-[#0057E7]" style={{ width: `${Math.min(100, Math.abs(Number(row.points)))}%` }} /></div>
                      <span>{row.points} điểm</span>
                    </div>
                  ))}
                </div>
              </section>

              <Grid title="Lịch sử giao dịch điểm" rows={data.transactions} columns={["created_at", "type", "points", "balance_after", "note"]} />
              <Grid title="Lịch sử đổi quà" rows={data.redemptions} columns={["created_at", "reward_name", "points_spent", "status", "voucher_code", "processed_at", "note"]} />
              <Grid title="Đơn Shopee đã cộng điểm" rows={data.shopeeOrders} columns={["approved_at", "shopee_order_code", "order_amount", "approved_points", "verification_status"]} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: any }) {
  return <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-5"><div className="text-[12px] font-bold text-[#64748B]">{label}</div><div className="mt-2 text-[24px] font-black text-[#0B1F3A]">{String(value).toLocaleString()}</div></div>;
}

function Grid({ title, rows, columns }: { title: string; rows: any[]; columns: string[] }) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-[#DCEBFF] bg-white">
      <h2 className="border-b border-[#EEF6FF] p-5 font-black text-[#0B1F3A]">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-[12px]">
          <thead className="bg-[#F8FBFF] uppercase text-[#64748B]"><tr>{columns.map((col) => <th key={col} className="px-4 py-3">{col}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#EEF6FF]">{(rows || []).map((row, idx) => <tr key={idx}>{columns.map((col) => <td key={col} className="px-4 py-3 font-semibold">{row[col] ?? "-"}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

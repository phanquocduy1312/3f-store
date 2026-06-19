import { useState, useEffect } from "react";
import { adminCustomersApi } from "@/src/api/adminCustomersApi";
import { MonitorSmartphone, Globe, Clock, ShieldAlert, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function CustomerSessionsTab({ customerId }: { customerId: number }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revoking, setRevoking] = useState(false);

  const fetchSessions = () => {
    setLoading(true);
    adminCustomersApi.getSessions(customerId).then(data => {
      setSessions(data);
      setLoading(false);
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchSessions();
  }, [customerId]);

  const handleRevokeAll = async () => {
    if (!window.confirm("Cảnh báo: Hành động này sẽ đăng xuất người dùng khỏi TẤT CẢ các thiết bị. Bạn có chắc chắn muốn tiếp tục?")) return;
    
    setRevoking(true);
    try {
      await adminCustomersApi.revokeAllSessions(customerId);
      toast.success("Đã thu hồi toàn bộ phiên đăng nhập");
      fetchSessions();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi thu hồi phiên");
    } finally {
      setRevoking(false);
    }
  };

  if (loading && sessions.length === 0) return <div className="animate-pulse space-y-4"><div className="h-10 bg-slate-100 rounded-xl"></div><div className="h-32 bg-slate-100 rounded-xl"></div></div>;
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-xl">{error}</div>;

  const hasActiveSessions = sessions.some(s => s.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-black text-[#0B1F3A]">Phiên đăng nhập (Sessions)</h2>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <ShieldAlert size={16} /> Chỉ hiển thị thông tin metadata
          </div>
        </div>
        {hasActiveSessions && (
          <button 
            onClick={handleRevokeAll}
            disabled={revoking}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            <AlertTriangle size={16} /> {revoking ? "Đang xử lý..." : "Thu hồi tất cả phiên"}
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-10 text-slate-500">Không có dữ liệu phiên đăng nhập.</div>
      ) : (
        <div className="space-y-3">
          {sessions.map((sess) => (
            <div key={sess.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-start gap-4 mb-3 sm:mb-0">
                <div className={`p-2 rounded-lg ${sess.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                  <MonitorSmartphone size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#0B1F3A] truncate max-w-[200px] sm:max-w-xs">{sess.user_agent || "Không xác định thiết bị"}</p>
                    {sess.status === 'active' && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full">Đang hoạt động</span>}
                    {sess.status === 'expired' && <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] uppercase font-bold rounded-full">Đã hết hạn</span>}
                    {sess.status === 'revoked' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] uppercase font-bold rounded-full">Đã thu hồi</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Globe size={12} /> IP: {sess.ip_address ? sess.ip_address.replace(/\.\d+$/, '.*') : 'Ẩn'}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> Bắt đầu: {new Date(sess.created_at).toLocaleString("vi-VN")}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

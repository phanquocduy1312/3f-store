import { FormEvent, useEffect, useMemo, useState } from "react";
import { Laptop, Loader2, LockKeyhole, LogOut, MonitorSmartphone, ShieldCheck, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { removeCustomerToken } from "@/src/api/customerAuthApi";
import { getProfileApi, type ProfileData } from "@/src/api/customerProfileApi";
import {
  changePasswordApi,
  listSessionsApi,
  logoutAllSessionsApi,
  revokeSessionApi,
  type SessionData,
} from "@/src/api/customerSecurityApi";

function formatDateTime(value: string) {
  if (!value) return "Không rõ";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function maskIp(value: string) {
  if (!value) return "Đã ẩn";
  if (value.includes(":")) return `${value.slice(0, 8)}...`;
  return value.replace(/\.\d+$/, ".*");
}

function describeDevice(userAgent: string) {
  const value = userAgent || "";
  if (/iphone|ipad|android|mobile/i.test(value)) return "Thiết bị di động";
  if (/windows/i.test(value)) return "Windows";
  if (/macintosh|mac os/i.test(value)) return "macOS";
  if (/linux/i.test(value)) return "Linux";
  return "Trình duyệt";
}

function validatePassword(profile: ProfileData | null, currentPassword: string, newPassword: string, confirmPassword: string) {
  if (profile?.hasPassword && !currentPassword.trim()) return "Vui lòng nhập mật khẩu hiện tại.";
  if (newPassword.length < 8) return "Mật khẩu mới cần ít nhất 8 ký tự.";
  if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return "Mật khẩu mới nên có cả chữ và số.";
  }
  if (newPassword !== confirmPassword) return "Xác nhận mật khẩu chưa khớp.";
  return "";
}

export function SecurityPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [sessionBusyId, setSessionBusyId] = useState<number | "all" | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const otherSessions = useMemo(() => sessions.filter((session) => !session.isCurrent), [sessions]);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [profileRes, sessionsRes] = await Promise.all([getProfileApi(), listSessionsApi()]);
      if (profileRes.success && profileRes.data) setProfile(profileRes.data);
      if (sessionsRes.success) {
        setSessions(sessionsRes.data ?? []);
      } else {
        toast.error(sessionsRes.message || "Không thể tải phiên đăng nhập.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải thông tin bảo mật.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validatePassword(profile, currentPassword, newPassword, confirmPassword);
    if (validation) {
      toast.error(validation);
      return;
    }

    setSavingPassword(true);
    try {
      const res = await changePasswordApi({
        currentPassword: profile?.hasPassword ? currentPassword : undefined,
        newPassword,
        newPasswordConfirmation: confirmPassword,
      });

      if (res.success) {
        toast.success(profile?.hasPassword ? "Đã đổi mật khẩu." : "Đã thiết lập mật khẩu.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        const refreshed = await getProfileApi();
        if (refreshed.success && refreshed.data) setProfile(refreshed.data);
      } else {
        toast.error(res.message || "Không thể cập nhật mật khẩu.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật mật khẩu.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRevokeSession = async (session: SessionData) => {
    if (session.isCurrent) {
      toast.error("Không thể thu hồi phiên hiện tại bằng thao tác này.");
      return;
    }
    if (!confirm("Bạn muốn đăng xuất phiên này?")) return;

    setSessionBusyId(session.id);
    try {
      const res = await revokeSessionApi(session.id);
      if (res.success) {
        toast.success("Đã đăng xuất phiên đã chọn.");
        setSessions((prev) => prev.filter((item) => item.id !== session.id));
      } else {
        toast.error(res.message || "Không thể thu hồi phiên.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể thu hồi phiên.");
    } finally {
      setSessionBusyId(null);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm("Thao tác này sẽ đăng xuất tài khoản khỏi tất cả thiết bị. Tiếp tục?")) return;

    setSessionBusyId("all");
    try {
      const res = await logoutAllSessionsApi();
      if (res.success) {
        removeCustomerToken();
        toast.success("Đã đăng xuất tất cả phiên.");
        navigate("/login?redirect=%2Faccount%2Fsecurity", { replace: true });
      } else {
        toast.error(res.message || "Không thể đăng xuất tất cả phiên.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể đăng xuất tất cả phiên.");
    } finally {
      setSessionBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0057E7]">Bảo mật</p>
        <h2 className="mt-1 text-2xl font-black text-[#0B1F3A]">Bảo mật tài khoản</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Quản lý mật khẩu và các thiết bị đang đăng nhập tài khoản 3F Store.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-[#DCEBFF] bg-[#F6FAFF]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0057E7]" />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-2xl border border-[#DCEBFF] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF6FF] text-[#0057E7]">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0B1F3A]">
                  {profile?.hasPassword ? "Đổi mật khẩu" : "Thiết lập mật khẩu"}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {profile?.hasPassword
                    ? "Dùng mật khẩu mạnh và thay đổi định kỳ khi nghi ngờ có rủi ro."
                    : "Tài khoản hiện chưa có mật khẩu riêng. Hãy thiết lập để đăng nhập an toàn hơn."}
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              {profile?.hasPassword && (
                <label className="space-y-2">
                  <span className="text-sm font-black text-[#0B1F3A]">Mật khẩu hiện tại</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                    autoComplete="current-password"
                  />
                </label>
              )}
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Mật khẩu mới</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                  autoComplete="new-password"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-black text-[#0B1F3A]">Xác nhận mật khẩu mới</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[#DCEBFF] px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                  autoComplete="new-password"
                />
              </label>

              <div className="rounded-xl bg-[#F6FAFF] p-4 text-sm font-semibold text-slate-600">
                <div className="mb-2 flex items-center gap-2 font-black text-[#0B1F3A]">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  Gợi ý mật khẩu
                </div>
                Dùng tối thiểu 8 ký tự, có chữ và số. Không dùng lại mật khẩu từ các website khác.
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0057E7] px-5 text-sm font-black text-white transition hover:bg-[#0046BA] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                {profile?.hasPassword ? "Đổi mật khẩu" : "Thiết lập mật khẩu"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-[#DCEBFF] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF6FF] text-[#0057E7]">
                  <MonitorSmartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0B1F3A]">Phiên đăng nhập</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Kiểm tra và thu hồi phiên từ thiết bị lạ.
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogoutAll}
                disabled={sessionBusyId === "all" || sessions.length === 0}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sessionBusyId === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                Đăng xuất tất cả
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {sessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#DCEBFF] bg-[#F6FAFF] p-8 text-center text-sm font-bold text-slate-500">
                  Chưa có dữ liệu phiên đăng nhập.
                </div>
              ) : (
                sessions.map((session) => (
                  <article
                    key={session.id}
                    className={`rounded-2xl border p-4 ${
                      session.isCurrent ? "border-green-200 bg-green-50/60" : "border-[#DCEBFF] bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#0057E7] ring-1 ring-[#DCEBFF]">
                          <Laptop className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-black text-[#0B1F3A]">{describeDevice(session.userAgent)}</h4>
                            {session.isCurrent && (
                              <span className="rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-black text-white">
                                Hiện tại
                              </span>
                            )}
                          </div>
                          <p className="mt-1 break-words text-xs font-semibold text-slate-500">{session.userAgent}</p>
                          <div className="mt-3 grid gap-2 text-xs font-bold text-slate-500 sm:grid-cols-3">
                            <span>IP: {maskIp(session.ipAddress)}</span>
                            <span>Tạo: {formatDateTime(session.createdAt)}</span>
                            <span>Hết hạn: {formatDateTime(session.expiresAt)}</span>
                          </div>
                        </div>
                      </div>

                      {!session.isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(session)}
                          disabled={sessionBusyId === session.id}
                          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {sessionBusyId === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Thu hồi
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>

            {otherSessions.length > 0 && (
              <p className="mt-4 text-xs font-semibold text-slate-500">
                Có {otherSessions.length} phiên khác ngoài thiết bị hiện tại.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Camera,
  Edit2,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProfileApi,
  patchProfileApi,
  requestPhoneChangeApi,
  uploadAvatarApi,
  verifyPhoneChangeApi,
  requestEmailVerificationApi,
  verifyEmailVerificationApi,
  type ProfileData,
} from "@/src/api/customerProfileApi";

const genderOptions = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-bold uppercase text-slate-500">{children}</label>;
}

function VerificationPill({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
      <BadgeCheck className="h-3.5 w-3.5" /> Đã xác minh
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
      <AlertCircle className="h-3.5 w-3.5" /> Chưa xác minh
    </span>
  );
}

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    birthday: "",
    gender: "other",
  });

  const fetchProfile = async () => {
    try {
      const res = await getProfileApi();
      if (res.success && res.data) {
        setProfile(res.data);
        setFormData({
          fullName: res.data.fullName || "",
          email: res.data.email || "",
          birthday: res.data.birthday ? res.data.birthday.split(" ")[0] : "",
          gender: res.data.gender || "other",
        });
      }
    } catch (e: any) {
      toast.error(e.message || "Không thể tải hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await patchProfileApi({
        fullName: formData.fullName.trim(),
        email: formData.email.trim() || undefined,
        birthday: formData.birthday || undefined,
        gender: formData.gender,
      });
      if (res.success) {
        toast.success("Cập nhật hồ sơ thành công");
        fetchProfile();
      } else {
        toast.error(res.message || "Không thể cập nhật hồ sơ");
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Vui lòng chọn ảnh dưới 2MB");
      return;
    }

    try {
      const toastId = toast.loading("Đang tải ảnh lên...");
      const res = await uploadAvatarApi(file);
      const avatarUrl = res.avatarUrl;
      if (res.success && avatarUrl) {
        await patchProfileApi({ fullName: formData.fullName, avatarUrl });
        setProfile(prev => prev ? { ...prev, avatarUrl } : null);
        toast.success("Cập nhật ảnh đại diện thành công", { id: toastId });
      } else {
        toast.error(res.message || "Upload thất bại", { id: toastId });
      }
    } catch {
      toast.error("Lỗi tải ảnh");
    }
  };

  const handleRequestOtp = async () => {
    const phone = newPhone.trim();
    if (!phone || phone.length < 9) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    setPhoneSaving(true);
    try {
      const res = await requestPhoneChangeApi(phone);
      if (res.success) {
        setOtpSent(true);
        toast.success("Mã OTP đã được gửi");
        if (res.devOtp) toast.info(`[DEV OTP]: ${res.devOtp}`, { duration: 10000 });
      } else {
        toast.error(res.message || "Không thể gửi OTP");
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi gửi OTP");
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setPhoneSaving(true);
    try {
      const res = await verifyPhoneChangeApi(newPhone.trim(), otp);
      if (res.success) {
        toast.success("Đổi số điện thoại thành công");
        setIsChangingPhone(false);
        setOtpSent(false);
        setOtp("");
        setNewPhone("");
        fetchProfile();
      } else {
        toast.error(res.message || "Xác thực OTP thất bại");
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi xác thực OTP");
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleRequestEmailOtp = async () => {
    const email = profile?.email?.trim();
    if (!email) {
      toast.error("Vui lòng cập nhật email trước");
      return;
    }

    setEmailSaving(true);
    try {
      const res = await requestEmailVerificationApi(email);
      if (res.success) {
        setEmailOtpSent(true);
        toast.success("Mã OTP đã được gửi đến email của bạn");
        if (res.devOtp) toast.info(`[DEV OTP]: ${res.devOtp}`, { duration: 10000 });
      } else {
        toast.error(res.message || "Không thể gửi OTP");
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi gửi OTP");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    const email = profile?.email?.trim();
    if (!email) return;

    if (emailOtp.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setEmailSaving(true);
    try {
      const res = await verifyEmailVerificationApi(email, emailOtp);
      if (res.success) {
        toast.success("Xác thực Email thành công!");
        setIsVerifyingEmail(false);
        setEmailOtpSent(false);
        setEmailOtp("");
        fetchProfile();
      } else {
        toast.error(res.message || "Xác thực OTP thất bại");
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi xác thực OTP");
    } finally {
      setEmailSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-28 rounded-2xl bg-slate-100" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-72 rounded-2xl bg-slate-100" />
          <div className="h-72 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="rounded-2xl bg-red-50 p-5 text-sm font-bold text-red-600">Không có dữ liệu hồ sơ.</div>;
  }

  const avatarUrl = profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || "3F")}&background=0B1F3A&color=fff`;
  const completion = profile.stats.profileCompletion || 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#DCEBFF] bg-[#F8FBFF] p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="group relative shrink-0">
              <img src={avatarUrl} alt={profile.fullName} className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-sm" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/45 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Đổi ảnh đại diện"
              >
                <Camera className="h-6 w-6" />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-black text-[#0B1F3A]">{profile.fullName}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <VerificationPill verified={Boolean(profile.phoneVerifiedAt)} />
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500">Thành viên 3F</span>
              </div>
            </div>
          </div>

          <div className="w-full rounded-2xl bg-white p-4 md:w-72">
            <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-600">
              <span>Hoàn thiện hồ sơ</span>
              <span className="text-[#0057E7]">{completion}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#0057E7] transition-all" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-400">Hồ sơ đầy đủ giúp đơn hàng, ưu đãi và tư vấn thú cưng chính xác hơn.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-[#DCEBFF] bg-white p-5">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
            <UserRound className="h-5 w-5 text-[#0057E7]" />
            <h3 className="text-lg font-black text-[#0B1F3A]">Thông tin cá nhân</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel>Họ và tên</FieldLabel>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
                required
              />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
              />
            </div>
            <div>
              <FieldLabel>Ngày sinh</FieldLabel>
              <input
                type="date"
                value={formData.birthday}
                onChange={e => setFormData({ ...formData, birthday: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-[#0057E7]"
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Giới tính</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {genderOptions.map(option => (
                  <label
                    key={option.value}
                    className={`flex h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-bold transition ${
                      formData.gender === option.value
                        ? "border-[#0057E7] bg-[#EEF6FF] text-[#0057E7]"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B1F3A] px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Lưu thay đổi
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#DCEBFF] bg-white p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
              <ShieldCheck className="h-5 w-5 text-[#0057E7]" />
              <h3 className="font-black text-[#0B1F3A]">Xác thực liên hệ</h3>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl bg-[#F8FBFF] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400"><Phone className="h-3.5 w-3.5" />Số điện thoại</div>
                    <div className="mt-1 truncate font-black text-[#0B1F3A]">{profile.phone || "Chưa cập nhật"}</div>
                  </div>
                  <VerificationPill verified={Boolean(profile.phoneVerifiedAt)} />
                </div>
                {!isChangingPhone && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.phone && !profile.phoneVerifiedAt && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewPhone(profile.phone || "");
                          setIsChangingPhone(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0057E7] px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> Xác minh ngay
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setNewPhone("");
                        setIsChangingPhone(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCEBFF] bg-white px-3 py-2 text-xs font-bold text-[#0057E7] hover:bg-[#EEF6FF]"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> {profile.phone ? "Đổi số điện thoại" : "Thêm số điện thoại"}
                    </button>
                  </div>
                )}
              </div>

              {isChangingPhone && (
                <div className="rounded-xl border border-[#DCEBFF] p-3">
                  {!otpSent ? (
                    <div className="space-y-3">
                      <div>
                        <FieldLabel>{newPhone === profile.phone ? "Xác minh số điện thoại hiện tại" : "Số điện thoại mới"}</FieldLabel>
                        <input
                          type="tel"
                          value={newPhone}
                          onChange={e => setNewPhone(e.target.value)}
                          placeholder="Ví dụ: 0912345678"
                          disabled={newPhone === profile.phone}
                          className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#0057E7] disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={handleRequestOtp} disabled={phoneSaving} className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[#0057E7] text-xs font-bold text-white disabled:opacity-60">
                          {phoneSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gửi OTP"}
                        </button>
                        <button type="button" onClick={() => setIsChangingPhone(false)} className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-500">Hủy</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-500">Nhập mã OTP đã gửi đến {newPhone}.</p>
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="------"
                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-center text-lg font-black tracking-[0.35em] outline-none focus:border-[#0057E7]"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={handleVerifyOtp} disabled={phoneSaving || otp.length !== 6} className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[#0057E7] text-xs font-bold text-white disabled:opacity-60">
                          {phoneSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xác nhận"}
                        </button>
                        <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }} className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-500">Nhập lại</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-xl bg-[#F8FBFF] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400"><Mail className="h-3.5 w-3.5" />Email</div>
                    <div className="mt-1 truncate font-black text-[#0B1F3A]">{profile.email || "Chưa cập nhật"}</div>
                  </div>
                  <VerificationPill verified={Boolean(profile.emailVerifiedAt)} />
                </div>
                {!isVerifyingEmail && profile.email && !profile.emailVerifiedAt && (
                  <button
                    type="button"
                    onClick={() => setIsVerifyingEmail(true)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0057E7] px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> Xác minh ngay
                  </button>
                )}
              </div>

              {isVerifyingEmail && (
                <div className="rounded-xl border border-[#DCEBFF] p-3">
                  {!emailOtpSent ? (
                    <div className="space-y-3">
                      <div>
                        <FieldLabel>Xác minh Email</FieldLabel>
                        <input
                          type="email"
                          value={profile.email || ""}
                          disabled
                          className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#0057E7] disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={handleRequestEmailOtp} disabled={emailSaving} className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[#0057E7] text-xs font-bold text-white disabled:opacity-60">
                          {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gửi OTP"}
                        </button>
                        <button type="button" onClick={() => setIsVerifyingEmail(false)} className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-500">Hủy</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-500">Nhập mã OTP đã gửi đến {profile.email}.</p>
                      <input
                        type="text"
                        value={emailOtp}
                        onChange={e => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="------"
                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-center text-lg font-black tracking-[0.35em] outline-none focus:border-[#0057E7]"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={handleVerifyEmailOtp} disabled={emailSaving || emailOtp.length !== 6} className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[#0057E7] text-xs font-bold text-white disabled:opacity-60">
                          {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xác nhận"}
                        </button>
                        <button type="button" onClick={() => { setEmailOtpSent(false); setEmailOtp(""); }} className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-500">Nhập lại</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#DCEBFF] bg-white p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F8FBFF] p-3">
                <ShoppingMetric icon={<CalendarDays className="h-4 w-4" />} label="Ngày tham gia" value={new Date(profile.createdAt).toLocaleDateString("vi-VN")} />
              </div>
              <div className="rounded-xl bg-[#F8FBFF] p-3">
                <ShoppingMetric icon={<ShieldCheck className="h-4 w-4" />} label="Mật khẩu" value={profile.hasPassword ? "Đã thiết lập" : "Chưa có"} />
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ShoppingMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400">{icon}{label}</div>
      <div className="text-sm font-black text-[#0B1F3A]">{value}</div>
    </div>
  );
}

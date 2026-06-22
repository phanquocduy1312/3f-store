import { useEffect, useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/src/config/api";
import { Loader2, Save } from "lucide-react";

type SettingItem = {
  value: string;
  description: string;
};

type SettingsMap = Record<string, SettingItem>;

export function ClubSettingsSection() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("point_formula");

  const subTabs = [
    { id: "point_formula", label: "Cách tính điểm" },
    { id: "tiers", label: "Hạng thành viên" },
    { id: "expiry", label: "Hạn điểm" },
    { id: "channels", label: "Kênh bán hàng" },
    { id: "otp", label: "OTP & Bảo mật" },
  ];

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/3f-club/settings`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-Admin-Token": token || "",
        }
      });
      const data = await res.json();
      if (data.success) {
        const dbSettings = data.data || {};
        if (!dbSettings.include_shipping) {
          dbSettings.include_shipping = { value: "0", description: "Tính phí vận chuyển khi tích lũy điểm" };
        }
        if (!dbSettings.include_points_payment) {
          dbSettings.include_points_payment = { value: "0", description: "Tích lũy điểm cho phần thanh toán bằng điểm" };
        }
        setSettings(dbSettings);
      } else {
        toast.error(data.message || "Không tải được cấu hình.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ cấu hình.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const moneyPerPoint = Number(settings.money_per_point?.value);
    const pointRedeemValue = Number(settings.point_redeem_value?.value);
    const expiryMonths = Number(settings.point_expiry_months?.value);
    const reminderDays = Number(settings.expiry_reminder_days?.value);

    if (isNaN(moneyPerPoint) || moneyPerPoint <= 0) {
      toast.error("Số tiền để đổi 1 điểm phải lớn hơn 0.");
      return;
    }
    if (isNaN(pointRedeemValue) || pointRedeemValue <= 0) {
      toast.error("Giá trị quy đổi điểm phải lớn hơn 0.");
      return;
    }
    if (isNaN(expiryMonths) || expiryMonths <= 0) {
      toast.error("Hạn sử dụng điểm phải lớn hơn 0.");
      return;
    }
    if (isNaN(reminderDays) || reminderDays < 0) {
      toast.error("Số ngày báo trước khi hết hạn không được âm.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const payload: Record<string, string> = {};
      Object.entries(settings).forEach(([key, item]) => {
        payload[key] = item.value;
      });

      const res = await fetch(`${API_BASE_URL}/api/admin/3f-club/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Admin-Token": token || "",
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Lưu cấu hình thành công!");
      } else {
        toast.error(data.message || "Lưu cấu hình thất bại.");
      }
    } catch (err) {
      toast.error("Lỗi khi lưu cấu hình.");
    } finally {
      setSaving(false);
    }
  };

  const updateValue = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0057E7]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-[20px] border border-[#DCEBFF] bg-white p-6 shadow-[0_8px_24px_rgba(6,43,95,0.02)]">
        <div className="border-b border-[#E2E8F0] pb-4">
          <h3 className="text-[16px] font-black text-[#0B1F3A]">Cách tính điểm</h3>
          <p className="text-[12px] text-[#64748B] mt-0.5">Thiết lập quy tắc tích lũy và quy đổi điểm 3F Club</p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 min-h-[300px]">
          <FormInput
            label="Số tiền để được 1 điểm (VND) *"
            keyName="money_per_point"
            value={settings.money_per_point?.value}
            desc={settings.money_per_point?.description || "Mặc định: 200đ = 1 điểm"}
            onChange={updateValue}
          />
          <FormInput
            label="Giá trị quy đổi điểm (VND) *"
            keyName="point_redeem_value"
            value={settings.point_redeem_value?.value}
            desc={settings.point_redeem_value?.description || "Mặc định: 1.000 điểm = 20.000đ (1 điểm = 20 VND)"}
            onChange={updateValue}
          />
          <FormSelect
            label="Có tính phí ship không? *"
            keyName="include_shipping"
            value={settings.include_shipping?.value || "0"}
            desc="Mặc định: Không (Không tích điểm trên phí ship)"
            onChange={updateValue}
            options={[
              { value: "0", label: "Không" },
              { value: "1", label: "Có" }
            ]}
          />
          <FormSelect
            label="Có tính phần thanh toán bằng điểm không? *"
            keyName="include_points_payment"
            value={settings.include_points_payment?.value || "0"}
            desc="Mặc định: Không (Trừ phần thanh toán bằng điểm trước khi tích)"
            onChange={updateValue}
            options={[
              { value: "0", label: "Không" },
              { value: "1", label: "Có" }
            ]}
          />
          <FormInput
            label="Hạn sử dụng điểm (tháng) *"
            keyName="point_expiry_months"
            value={settings.point_expiry_months?.value}
            desc={settings.point_expiry_months?.description || "Mặc định: 12 tháng"}
            onChange={updateValue}
          />
          <FormInput
            label="Nhắc trước khi hết hạn (ngày) *"
            keyName="expiry_reminder_days"
            value={settings.expiry_reminder_days?.value}
            desc={settings.expiry_reminder_days?.description || "Mặc định: 7 ngày"}
            onChange={updateValue}
          />
        </div>

        <div className="mt-8 flex justify-end border-t pt-5">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0057E7] px-6 text-[14px] font-bold text-white shadow-lg shadow-[#0057E7]/25 transition hover:bg-[#0046b8] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Lưu cấu hình
          </button>
        </div>
      </div>
    </form>
  );
}

function FormInput({
  label,
  keyName,
  value,
  desc,
  onChange
}: {
  label: string;
  keyName: string;
  value?: string;
  desc?: string;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] font-bold text-[#0B1F3A]">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(keyName, e.target.value)}
        className="h-11 rounded-xl border border-[#DCEBFF] px-4 text-[14px] font-medium text-[#0B1F3A] focus:border-[#0057E7] focus:outline-none"
      />
      {desc && <span className="text-[11px] text-[#64748B]">{desc}</span>}
    </div>
  );
}

function FormSelect({
  label,
  keyName,
  value,
  desc,
  onChange,
  options
}: {
  label: string;
  keyName: string;
  value?: string;
  desc?: string;
  onChange: (key: string, val: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] font-bold text-[#0B1F3A]">{label}</label>
      <select
        value={value || "0"}
        onChange={(e) => onChange(keyName, e.target.value)}
        className="h-11 rounded-xl border border-[#DCEBFF] px-4 text-[14px] font-medium text-[#0B1F3A] focus:border-[#0057E7] focus:outline-none bg-white cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {desc && <span className="text-[11px] text-[#64748B]">{desc}</span>}
    </div>
  );
}

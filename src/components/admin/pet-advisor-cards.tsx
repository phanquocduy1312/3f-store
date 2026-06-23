import type { ReactNode } from "react";

export type KpiTone = "blue" | "green" | "amber" | "red" | "slate";

export function KpiCard({
  icon,
  label,
  value,
  tone = "blue",
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone?: KpiTone;
}) {
  const toneClass = {
    blue: "bg-[#EEF6FF] text-[#0057E7]",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-[#DCEBFF] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>{icon}</div>
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase text-slate-400">{label}</div>
          <div className="truncate text-lg font-black text-[#0B1F3A]">{value}</div>
        </div>
      </div>
    </div>
  );
}

export function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="min-h-[86px] rounded-2xl border border-[#DCEBFF] bg-[#F6FAFF] p-4 flex flex-col justify-center">
      <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-2 line-clamp-2 break-words text-sm font-black text-[#0B1F3A]">{value}</p>
    </div>
  );
}

export function DetailPanel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#DCEBFF] bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#0B1F3A] border-b border-[#F1F5F9] pb-3">
        {icon}
        {title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 [&>div:only-child]:sm:col-span-2">{children}</div>
    </section>
  );
}

export function InfoRow({
  label,
  value,
  multiline = false,
  icon,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className={`min-h-[68px] overflow-hidden rounded-xl bg-[#F6FAFF] p-3 ${multiline ? "sm:col-span-2" : ""}`}>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-black uppercase leading-snug text-slate-400">
        {icon}
        {label}
      </div>
      <div className={`mt-1 break-words text-sm font-bold text-[#0B1F3A] ${multiline ? "leading-relaxed" : "truncate"}`}>
        {value}
      </div>
    </div>
  );
}

import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { shopeeApiOptions, shopeeStatusOptions, shopeeTimeOptions } from "@/lib/shopee-requests";

interface ShopeeFiltersProps {
  search: string;
  statusFilter: string;
  apiFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onApiFilterChange: (value: string) => void;
  onReset: () => void;
  onOpenAdvanced: () => void;
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="relative min-w-[150px] flex-1 sm:flex-none">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-2xl border border-[#DCEBFF] bg-white px-4 pr-10 text-[13px] font-semibold text-[#0B1F3A] outline-none transition focus:border-[#0057E7] focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
    </div>
  );
}

export function ShopeeFilters(props: ShopeeFiltersProps) {
  return (
    <section className="min-w-0 rounded-[24px] border border-[#DCEBFF] bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 min-w-[280px] flex-1 items-center gap-3 rounded-2xl border border-[#DCEBFF] bg-white px-4 focus-within:border-[#0057E7] focus-within:ring-4 focus-within:ring-blue-100">
          <Search className="h-4 w-4 shrink-0 text-[#64748B]" />
          <input
            value={props.search}
            onChange={(event) => props.onSearchChange(event.target.value)}
            placeholder="Tìm kiếm mã đơn, SĐT, tên khách..."
            className="w-full bg-transparent text-[13px] text-[#0B1F3A] outline-none placeholder:text-[#94A3B8]"
          />
        </div>

        <FilterSelect value={props.statusFilter} onChange={props.onStatusFilterChange} options={shopeeStatusOptions} />
        <FilterSelect value={props.apiFilter} onChange={props.onApiFilterChange} options={shopeeApiOptions} />

        <button
          type="button"
          onClick={props.onOpenAdvanced}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#DCEBFF] bg-white px-5 text-[13px] font-bold text-[#0057E7] transition hover:bg-[#F6FAFF]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Bộ lọc
        </button>
        <button
          type="button"
          onClick={props.onReset}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#DCEBFF] bg-white px-5 text-[13px] font-bold text-[#64748B] transition hover:bg-[#F6FAFF]"
        >
          <RotateCcw className="h-4 w-4" />
          Làm mới
        </button>
      </div>
    </section>
  );
}


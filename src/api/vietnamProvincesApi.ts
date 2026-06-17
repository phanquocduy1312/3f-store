export interface Province {
  code: number;
  name: string;
  codename: string;
  division_type: string;
}

export interface Ward {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  province_code: number;
}

export interface ProvinceDetail extends Province {
  wards: Ward[];
}

export async function getProvinces(): Promise<Province[]> {
  const res = await fetch("https://provinces.open-api.vn/api/v2/p/");
  if (!res.ok) {
    throw new Error("Không thể tải danh sách tỉnh/thành. Vui lòng thử lại.");
  }
  return res.json();
}

export async function getProvinceDetail(provinceCode: number | string): Promise<ProvinceDetail> {
  const res = await fetch(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`);
  if (!res.ok) {
    throw new Error("Không thể tải thông tin chi tiết. Vui lòng thử lại.");
  }
  return res.json();
}

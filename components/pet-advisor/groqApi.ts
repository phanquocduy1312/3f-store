import { AiResultData } from "./mockAiResult";
import { consultPetAdviceApi } from "@/src/api/customerPetsApi";

const FALLBACK_RESULT: AiResultData = {
  summary: "3F đã ghi nhận hồ sơ của bé.",
  advice: "Dựa trên thông tin anh/chị cung cấp, 3F gợi ý chọn nhóm sản phẩm phù hợp với độ tuổi, nhu cầu và ngân sách của bé.",
  detected_needs: ["Khác"],
  budget_analysis: {
    purchase_amount_label: "500K – 1 triệu",
    usage_duration_label: "3 – 4 tháng",
    monthly_budget: 214000,
    budget_segment: "Phổ thông",
    explanation: "Đang sử dụng gợi ý tiêu chuẩn do hệ thống gián đoạn."
  },
  recommended_products: [
    {
      id: 1,
      group: "balanced",
      reason: "Cân đối tốt dinh dưỡng hằng ngày, hỗ trợ nhu cầu chính và phù hợp túi tiền.",
      matched_need: ["Khác"],
      budget_fit: "Phù hợp ngân sách thực tế",
      product: {
        id: "1",
        name: "Thức ăn hạt SmartHeart vị bò nướng cho chó trưởng thành - Bao 20kg",
        price: "838.500đ",
        image: "https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/2179a66cb8bc4045b6e000b27247c125~tplv-aphluv4xwc-crop-webp:1280:1280.webp",
        rating: 5,
        reviews: 20,
        sold: 90
      }
    },
    {
      id: 2,
      group: "saving",
      reason: "Giải pháp kinh tế nhưng vẫn bảo đảm chất lượng bữa ăn cho bé.",
      matched_need: ["Khác"],
      budget_fit: "Tối ưu hóa chi phí",
      product: {
        id: "2",
        name: "Thức ăn hạt Zoi Dog cho chó lớn - Bao 20kg",
        price: "713.900đ",
        image: "https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/4a4ddf43f3114d53b5ee57e0561af91e~tplv-aphluv4xwc-crop-webp:1200:1200.webp",
        rating: 5,
        reviews: 10,
        sold: 40
      }
    }
  ],
  care_tips: [
    "Nếu bé có dấu hiệu bất thường về sức khỏe hoặc bỏ ăn liên tục, hãy đưa bé đến bác sĩ thú y gần nhất.",
    "Giữ cho bé uống đủ nước mỗi ngày và hạn chế ăn thức ăn của người."
  ],
  warning: "",
  voucher_code: "3F30K"
};

export async function getPetAdviceFromGroq(
  answers: Record<string, { value: string | string[]; customText?: string }>,
  petType: "dog" | "cat" | "both",
  activeFlow: "dog" | "cat" | null,
  customer: { name: string; phone: string; email: string; petName?: string }
): Promise<AiResultData> {
  try {
    const res = await consultPetAdviceApi({
      answers,
      petType,
      activeFlow,
      customer
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Không lấy được tư vấn từ máy chủ.");
    }

    return res.data;
  } catch (error: any) {
    console.error("[GROQ PROXY API ERROR]", error);
    return {
      ...FALLBACK_RESULT,
      error: `Hệ thống gián đoạn (${error.message || error}). Đang hiển thị kết quả tư vấn tiêu chuẩn.`
    };
  }
}

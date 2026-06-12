import { detectNeeds, detectSeriousWarning, calculateMonthlyBudget, getBudgetSegment, formatVnd } from "./petAdvisorUtils";

export interface QuizData {
  pet_type: "dog" | "cat" | "both";
  answers: Record<string, { value: string | string[]; customText?: string }>;
  customer: {
    name: string;
    phone: string;
    email?: string;
    petName?: string;
  };
}

export type RecommendedProductGroup = "saving" | "balanced" | "premium";

export interface AiRecommendedProduct {
  id: string | number;
  reason: string;
  group?: RecommendedProductGroup;
  matched_need?: string[];
  budget_fit?: string;
}

export interface AiBudgetAnalysis {
  purchase_amount_label: string;
  usage_duration_label: string;
  monthly_budget: number;
  budget_segment: string;
  explanation: string;
}

export interface AiResultData {
  summary: string;
  advice: string;
  detected_needs?: string[];
  budget_analysis?: AiBudgetAnalysis;
  recommended_products: AiRecommendedProduct[];
  care_tips: string[];
  warning: string;
  voucher_code: string;
  error?: string;
}

const labelsMap: Record<string, string> = {
  under_6_months: "dưới 6 tháng",
  "6_12_months": "6-12 tháng",
  adult_1_7: "trưởng thành (1-7 tuổi)",
  senior_7_plus: "lớn tuổi (trên 7 tuổi)",
  kitten_under_12: "mèo con (dưới 12 tháng)",
  unknown: "không rõ thông tin",
  under_200k: "dưới 200K",
  "200k_500k": "200K – 500K",
  "500k_1m": "500K – 1 triệu",
  "1m_2m": "1 – 2 triệu",
  over_2m: "trên 2 triệu",
  under_1m: "dưới 1 tháng",
  "1m": "khoảng 1 tháng",
  "2m": "2 tháng",
  "3_4m": "3 – 4 tháng",
  over_4m: "trên 4 tháng"
};

const getLabel = (val: string) => labelsMap[val] || val;

export async function getMockPetAdvice(data: QuizData): Promise<AiResultData> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const answers = data.answers;
  const isCat = data.pet_type === "cat" || answers.pet_type?.value === "cat";
  
  const age = (answers.age_group?.value as string) || "";
  const breed = (answers.breed?.value as string) || "";
  
  const problemText = (answers.problem_text?.value as string) || "";
  const detected = detectNeeds(problemText);
  const isSerious = detectSeriousWarning(problemText);

  // Budget calculations
  const purchaseVal = (answers.purchase_amount_range?.value as string) || "";
  const durationVal = (answers.usage_duration_range?.value as string) || "";

  let estimatedAmt = 0;
  if (purchaseVal === "under_200k") estimatedAmt = 150000;
  else if (purchaseVal === "200k_500k") estimatedAmt = 350000;
  else if (purchaseVal === "500k_1m") estimatedAmt = 750000;
  else if (purchaseVal === "1m_2m") estimatedAmt = 1500000;
  else if (purchaseVal === "over_2m") estimatedAmt = 2500000;

  let months = 1;
  if (durationVal === "under_1m") months = 0.5;
  else if (durationVal === "1m") months = 1;
  else if (durationVal === "2m") months = 2;
  else if (durationVal === "3_4m") months = 3.5;
  else if (durationVal === "over_4m") months = 4.5;

  const monthlyBudget = calculateMonthlyBudget(estimatedAmt, months);
  const budgetSegment = getBudgetSegment(monthlyBudget);

  const budgetAnalysis: AiBudgetAnalysis = {
    purchase_amount_label: getLabel(purchaseVal),
    usage_duration_label: getLabel(durationVal),
    monthly_budget: monthlyBudget,
    budget_segment: budgetSegment,
    explanation: `Chuyên gia ước tính ngân sách thực tế khoảng ${formatVnd(monthlyBudget)}/tháng dựa trên số tiền mua mỗi lần và thời gian sử dụng.`
  };

  const nameTag = data.customer.petName ? `Bé ${data.customer.petName}` : `Bé ${isCat ? "mèo" : "cún"}`;

  return {
    summary: `${nameTag} giống ${getLabel(breed)} (${getLabel(age)}), có biểu hiện: ${problemText || "bình thường"}.`,
    advice: `Dựa trên mô tả vấn đề của bé, 3F khuyên bạn nên lựa chọn các dòng sản phẩm hỗ trợ đặc thù cho các triệu chứng: ${detected.join(", ")}. Hãy kết hợp thức ăn ướt và khô giúp cải thiện sức khỏe lâu dài.`,
    detected_needs: detected,
    budget_analysis: budgetAnalysis,
    recommended_products: [
      {
        id: isCat ? 11 : 1, // Let's use standard existing mock IDs
        group: "balanced",
        reason: "Cân đối tốt dinh dưỡng hằng ngày, hỗ trợ nhu cầu chính và phù hợp túi tiền.",
        matched_need: [detected[0] || "Khác"],
        budget_fit: `Phù hợp phân khúc ${budgetSegment}`
      },
      {
        id: isCat ? 12 : 2,
        group: "saving",
        reason: "Giải pháp kinh tế nhưng vẫn bảo đảm chất lượng bữa ăn cho bé.",
        matched_need: ["Khác"],
        budget_fit: "Tối ưu hóa chi phí"
      },
      {
        id: isCat ? 13 : 3,
        group: "premium",
        reason: "Sản phẩm bổ sung cao cấp hỗ trợ da lông và đề kháng vượt trội.",
        matched_need: [detected[0] || "Khác"],
        budget_fit: "Thuộc phân khúc cao cấp"
      }
    ],
    care_tips: [
      "Nên chia nhỏ bữa ăn và không đổi thức ăn đột ngột (trộn đều trong 5–7 ngày).",
      "Luôn cung cấp đầy đủ nước uống sạch bên cạnh đĩa thức ăn của bé.",
      "Quan sát phân và thái độ ăn uống của bé trong những ngày đầu đổi hạt."
    ],
    warning: isSerious ? "⚠️ Cảnh báo: Triệu chứng của bé có dấu hiệu nghiêm trọng. Anh/chị hãy đưa bé đến cơ sở thú y gần nhất để thăm khám kịp thời." : "",
    voucher_code: "3F30K"
  };
}

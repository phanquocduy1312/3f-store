import { AiResultData } from "./mockAiResult";
import { getCatFoodProducts, getDogFoodProducts } from "@/data/store";
import { detectNeeds, detectSeriousWarning, calculateMonthlyBudget, getBudgetSegment } from "./petAdvisorUtils";

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
      budget_fit: "Phù hợp ngân sách thực tế"
    },
    {
      id: 2,
      group: "saving",
      reason: "Giải pháp kinh tế nhưng vẫn bảo đảm chất lượng bữa ăn cho bé.",
      matched_need: ["Khác"],
      budget_fit: "Tối ưu hóa chi phí"
    }
  ],
  care_tips: [
    "Nếu đổi thức ăn, nên trộn dần trong 5–7 ngày.",
    "Luôn chuẩn bị đủ nước sạch cho bé."
  ],
  warning: "",
  voucher_code: "3F30K"
};

const safeProcessEnv = (globalThis as any).process?.env || {};
const GROQ_API_KEY = "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";
const GROQ_MODEL = (
  (import.meta.env?.VITE_GROQ_MODEL as string) ||
  (safeProcessEnv?.NEXT_PUBLIC_GROQ_MODEL as string) ||
  (safeProcessEnv?.VITE_GROQ_MODEL as string) ||
  "llama-3.1-8b-instant"
).trim();

export async function getPetAdviceFromGroq(
  answers: Record<string, { value: string | string[]; customText?: string }>,
  petType: "dog" | "cat" | "both",
  activeFlow: "dog" | "cat" | null,
  customer: { name: string; phone: string; email: string; petName?: string }
): Promise<AiResultData> {

  let availableProducts = [];
  if (activeFlow === "cat" || petType === "cat") {
    availableProducts = getCatFoodProducts(30);
  } else if (activeFlow === "dog" || petType === "dog") {
    availableProducts = getDogFoodProducts(30);
  } else {
    availableProducts = [...getCatFoodProducts(15), ...getDogFoodProducts(15)];
  }

  const catalog = availableProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price
  }));

  const getAnswerValue = (stepId: string) => {
    const ans = answers[stepId];
    if (!ans) return "";
    if (Array.isArray(ans.value)) {
      return ans.value.map(v => v === "other" ? (ans.customText || "Khác") : v).join(", ");
    }
    return ans.value === "other" ? (ans.customText || "Khác") : ans.value;
  };

  const problemText = (answers.problem_text?.value as string) || "";
  const detectedNeeds = detectNeeds(problemText);
  const hasSeriousWarning = detectSeriousWarning(problemText);

  const purchaseVal = (answers.purchase_amount_range?.value as string) || "";
  const durationVal = (answers.usage_duration_range?.value as string) || "";

  let estimatedPurchaseAmount = 0;
  if (purchaseVal === "under_200k") estimatedPurchaseAmount = 150000;
  else if (purchaseVal === "200k_500k") estimatedPurchaseAmount = 350000;
  else if (purchaseVal === "500k_1m") estimatedPurchaseAmount = 750000;
  else if (purchaseVal === "1m_2m") estimatedPurchaseAmount = 1500000;
  else if (purchaseVal === "over_2m") estimatedPurchaseAmount = 2500000;

  let usageDurationMonths = 1;
  if (durationVal === "under_1m") usageDurationMonths = 0.5;
  else if (durationVal === "1m") usageDurationMonths = 1;
  else if (durationVal === "2m") usageDurationMonths = 2;
  else if (durationVal === "3_4m") usageDurationMonths = 3.5;
  else if (durationVal === "over_4m") usageDurationMonths = 4.5;

  const monthlyBudget = calculateMonthlyBudget(estimatedPurchaseAmount, usageDurationMonths);
  const budgetSegment = getBudgetSegment(monthlyBudget);

  const payload = {
    customer: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      pet_name: customer.petName || ""
    },
    pet_profile: {
      pet_type: petType,
      active_flow: activeFlow || petType,
      age_group: getAnswerValue("age_group"),
      breed: getAnswerValue("breed"),
      breed_other_text: answers.breed?.customText || "",
      weight_range: getAnswerValue("weight_range"),
      coat_type: getAnswerValue("coat_type"),
      pet_count: getAnswerValue("pet_count"),
      neutered_status: getAnswerValue("neutered_status"),
      current_food: getAnswerValue("current_food"),
      
      problem_text: problemText,
      detected_needs: detectedNeeds,
      selected_needs: getAnswerValue("need") ? getAnswerValue("need").split(", ") : [],
      
      purchase_amount_range: purchaseVal,
      estimated_purchase_amount: estimatedPurchaseAmount,
      usage_duration_range: durationVal,
      usage_duration_months: usageDurationMonths,
      monthly_budget: monthlyBudget,
      budget_segment: budgetSegment,
      has_serious_warning: hasSeriousWarning,
      budget: purchaseVal // Keep fallback reference
    },
    store_context: {
      brand: "3F Store",
      voucher_value: "30.000đ",
      voucher_code: "3F30K",
      product_catalog: catalog
    }
  };

  console.log("[GROQ REQUEST PAYLOAD]", payload);

  if (!GROQ_API_KEY) {
    return {
      ...FALLBACK_RESULT,
      error: "Không tìm thấy Groq API Key trong môi trường. Hệ thống đang hiển thị gợi ý mặc định."
    };
  }

  const systemPrompt = `Bạn là chuyên gia tư vấn thú cưng của 3F Store.
Bạn trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp, ngắn gọn. Gọi thú cưng là "bé".

Nhiệm vụ chính:
- Dựa trên pet_profile và product_catalog để chọn đúng sản phẩm thật từ catalog.
- Không được bịa sản phẩm ngoài catalog. Bắt buộc chọn sản phẩm có thật dựa trên trường 'id' của chúng trong catalog.
- Phải chọn tối đa 5 sản phẩm phù hợp nhất.

Luật mới về ngân sách:
- Không được hiểu purchase_amount_range là ngân sách hàng tháng.
- purchase_amount_range chỉ là số tiền khách thường mua mỗi lần.
- Phải dùng monthly_budget và budget_segment để hiểu ngân sách thực tế mỗi tháng.
- Khi tư vấn, hãy giải thích ngắn gọn rằng chuyên gia đã tính ngân sách thực tế dựa trên số tiền mua mỗi lần và thời gian sử dụng.

Luật mới về nhu cầu:
- problem_text là mô tả tự do của khách về tình trạng của bé.
- detected_needs là nhóm nhu cầu đã được hệ thống nhận diện.
- selected_needs là nhóm khách chọn thêm.
- Hãy ưu tiên các nhu cầu xuất hiện trong detected_needs và selected_needs.

Cách chia sản phẩm:
- recommended_products phải chia theo 3 nhóm:
  1. saving: Gói tiết kiệm
  2. balanced: Gói cân bằng (được ưu tiên nhất, gắn nhãn "3F đề xuất")
  3. premium: Gói tốt hơn cho bé
- Tổng cộng recommended_products tối đa là 5 sản phẩm.

An toàn:
- Không chẩn đoán bệnh, không kê đơn thuốc.
- Nếu has_serious_warning = true hoặc problem_text có dấu hiệu nặng như bỏ ăn nhiều ngày, nôn liên tục, tiêu chảy kéo dài, tiểu ra máu, khó thở, co giật, hãy thêm warning khuyên khách đưa bé đến bác sĩ thú y gấp.

CTA:
- Kết thúc bằng lời kêu gọi dùng voucher 30.000đ, mã 3F30K.

Trả về duy nhất định dạng JSON sau:
{
  "summary": "Tóm tắt ngắn gọn",
  "advice": "Lời khuyên dinh dưỡng chính",
  "detected_needs": ["Nhu cầu 1", "Nhu cầu 2"],
  "budget_analysis": {
    "purchase_amount_label": "Nhãn purchase_amount_range",
    "usage_duration_label": "Nhãn usage_duration_range",
    "monthly_budget": 123000,
    "budget_segment": "Nhãn phân khúc ngân sách",
    "explanation": "Lời giải thích cách tính ngân sách tháng từ mua mỗi lần"
  },
  "recommended_products": [
    {
      "id": "ID sản phẩm trong catalog",
      "group": "saving | balanced | premium",
      "reason": "Lý do lựa chọn sản phẩm",
      "matched_need": ["Nhu cầu phù hợp"],
      "budget_fit": "Badge phù hợp ngân sách"
    }
  ],
  "care_tips": [
    "Mẹo 1",
    "Mẹo 2"
  ],
  "warning": "Cảnh báo khẩn cấp nếu có, nếu không để rỗng",
  "cta": "Lời kêu gọi hành động",
  "voucher_code": "3F30K"
}`;

  const userPrompt = `Dưới đây là thông tin chi tiết về khách hàng và bé cưng:
${JSON.stringify(payload, null, 2)}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const responseData = await response.json();
    const assistantMessage = responseData?.choices?.[0]?.message?.content;
    if (!assistantMessage) {
      throw new Error("Empty content");
    }

    const parsedJson = JSON.parse(assistantMessage);

    return {
      summary: parsedJson.summary || "Đã ghi nhận hồ sơ bé cưng.",
      advice: parsedJson.advice || "3F gợi ý chế độ ăn cân bằng dinh dưỡng.",
      detected_needs: Array.isArray(parsedJson.detected_needs) ? parsedJson.detected_needs : detectedNeeds,
      budget_analysis: parsedJson.budget_analysis || {
        purchase_amount_label: purchaseVal,
        usage_duration_label: durationVal,
        monthly_budget: monthlyBudget,
        budget_segment: budgetSegment,
        explanation: `Ước tính ngân sách hàng tháng khoảng ${monthlyBudget.toLocaleString("vi-VN")}đ.`
      },
      recommended_products: Array.isArray(parsedJson.recommended_products) ? parsedJson.recommended_products : [],
      care_tips: Array.isArray(parsedJson.care_tips) ? parsedJson.care_tips : [],
      warning: parsedJson.warning || "",
      voucher_code: "3F30K"
    };

  } catch (error: any) {
    console.error("[GROQ API ERROR]", error);
    return {
      ...FALLBACK_RESULT,
      error: `Hệ thống gián đoạn (${error.message || error}). Đang hiển thị kết quả tư vấn tiêu chuẩn.`
    };
  }
}

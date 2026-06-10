import { AiResultData } from "./mockAiResult";
import { getCatFoodProducts, getDogFoodProducts } from "@/data/store";

const FALLBACK_RESULT: AiResultData = {
  summary: "3F đã ghi nhận hồ sơ của bé.",
  advice: "Dựa trên thông tin anh/chị cung cấp, 3F gợi ý chọn nhóm sản phẩm phù hợp với độ tuổi, nhu cầu và ngân sách của bé.",
  recommended_products: [
    {
      id: 1,
      reason: "Giúp bé có khẩu phần phù hợp với giai đoạn phát triển."
    },
    {
      id: 2,
      reason: "Phù hợp với vấn đề anh/chị đang quan tâm."
    },
    {
      id: 3,
      reason: "Giàu dinh dưỡng, tăng độ ngon miệng."
    },
    {
      id: 4,
      reason: "Bổ sung vitamin và khoáng chất."
    },
    {
      id: 5,
      reason: "Sản phẩm uy tín và được nhiều người mua."
    }
  ],
  care_tips: [
    "Nếu đổi thức ăn, nên trộn dần trong 5–7 ngày.",
    "Luôn chuẩn bị đủ nước sạch cho bé."
  ],
  warning: "",
  voucher_code: "3F30K"
};

// Safely access process.env for Next.js fallback without crashing in Vite
const safeProcessEnv = (globalThis as any).process?.env || {};

// Retrieve environment variables (Hardcoded for demo)
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
  customer: { name: string; phone: string; email: string }
): Promise<AiResultData> {

  // Generate simplified catalog
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

  // Build payload
  const payload = {
    customer: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email
    },
    pet_profile: {
      pet_type: petType,
      primary_pet: activeFlow || petType,
      age_group: getAnswerValue("age_group"),
      breed: getAnswerValue("breed"),
      breed_other_text: answers.breed?.customText || "",
      weight_range: getAnswerValue("weight_range"),
      coat_type: getAnswerValue("coat_type"),
      need: getAnswerValue("need"),
      health_note: "",
      current_food: getAnswerValue("current_food"),
      budget: getAnswerValue("budget"),
      pet_count: getAnswerValue("pet_count"),
      neutered_status: getAnswerValue("neutered_status")
    },
    store_context: {
      brand: "3F Store",
      voucher: "30.000đ",
      product_catalog: catalog
    }
  };

  console.log("[GROQ REQUEST PAYLOAD]", payload);

  if (!GROQ_API_KEY) {
    console.warn("[GROQ API] Missing API Key. Using fallback result.");
    return {
      ...FALLBACK_RESULT,
      error: "Không tìm thấy Groq API Key trong môi trường. Hệ thống đang hiển thị gợi ý mặc định."
    };
  }

  const systemPrompt = `Bạn là 3F AI Pet Advisor, trợ lý tư vấn thức ăn và sản phẩm chăm sóc chó mèo cho 3F Store.

Nhiệm vụ:
* Trả lời bằng tiếng Việt.
* Giọng văn thân thiện, ngắn gọn, chuyên nghiệp, dễ hiểu.
* Gọi thú cưng là “bé”.
* Đọc kỹ 'product_catalog' được cung cấp và LỌC RA ĐÚNG 5 SẢN PHẨM TỐT NHẤT phù hợp với nhu cầu, độ tuổi, giống loài của bé.
* Không chẩn đoán bệnh. Không kê thuốc.
* Phải chọn sản phẩm có thật trong 'product_catalog' dựa trên trường 'id' của chúng.
* Luôn kết thúc bằng CTA nhẹ: nhận voucher 30K, xem sản phẩm phù hợp hoặc để nhân viên 3F tư vấn thêm.
* Trả về JSON hợp lệ, không markdown, không giải thích ngoài JSON.

JSON schema bạn bắt buộc phải trả về:
{
  "summary": "Tóm tắt hồ sơ thú cưng trong 1 câu",
  "advice": "Đoạn tư vấn chính chi tiết, giải thích tại sao chế độ ăn này phù hợp",
  "recommended_products": [
    {
      "id": "ID của sản phẩm trong product_catalog",
      "reason": "Lý do ngắn gọn nhưng thuyết phục tại sao chọn sản phẩm này cho bé"
    }
  ],
  "care_tips": [
    "Mẹo chăm sóc 1",
    "Mẹo chăm sóc 2"
  ],
  "warning": "Cảnh báo nếu có, nếu không thì để chuỗi rỗng",
  "cta": "Lời kêu gọi hành động ngắn"
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
      const errorText = await response.text();
      throw new Error(`Groq API returned HTTP ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("[GROQ RESPONSE DATA]", responseData);

    const assistantMessage = responseData?.choices?.[0]?.message?.content;
    if (!assistantMessage) {
      throw new Error("Empty assistant message from Groq API response");
    }

    const parsedJson = JSON.parse(assistantMessage);

    // Validate fields inside returned JSON and map to AiResultData structure
    return {
      summary: parsedJson.summary || "Đã ghi nhận hồ sơ bé cưng.",
      advice: parsedJson.advice || "3F gợi ý chế độ ăn cân bằng dinh dưỡng.",
      recommended_products: Array.isArray(parsedJson.recommended_products) ? parsedJson.recommended_products.slice(0, 5) : [],
      care_tips: Array.isArray(parsedJson.care_tips) ? parsedJson.care_tips : [],
      warning: parsedJson.warning || "",
      voucher_code: "3F30K" // Default voucher code
    };

  } catch (error: any) {
    console.error("[GROQ API ERROR]", error);
    return {
      ...FALLBACK_RESULT,
      error: `Kết nối AI gián đoạn (${error.message || error}). Đang hiển thị kết quả tư vấn tiêu chuẩn.`
    };
  }
}

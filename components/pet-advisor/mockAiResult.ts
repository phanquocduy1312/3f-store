export interface QuizData {
  pet_type: "dog" | "cat" | "both";
  answers: Record<string, string>;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
}

export interface AiResultData {
  summary: string;
  advice: string;
  recommended_products: {
    id: string | number;
    reason: string;
  }[];
  care_tips: string[];
  warning: string;
  voucher_code: string;
  error?: string;
}

// Map choice value to readable label
const labelsMap: Record<string, string> = {
  // Pet Type
  dog: "Chó",
  cat: "Mèo",
  both: "Chó và Mèo",
  // Age Group
  under_6_months: "dưới 6 tháng",
  "6_12_months": "6-12 tháng",
  adult_1_7: "trưởng thành (1-7 tuổi)",
  senior_7_plus: "lớn tuổi (trên 7 tuổi)",
  kitten_under_12: "mèo con (dưới 12 tháng)",
  unknown: "không rõ thông tin",
  // Needs Dog
  daily: "ăn hàng ngày",
  gain_weight: "hỗ trợ tăng cân",
  picky_eater: "cải thiện kén ăn",
  digestion: "hỗ trợ tiêu hóa",
  skin_coat: "dưỡng da lông",
  allergy: "nhạy cảm/dị ứng",
  urinary: "hỗ trợ tiết niệu",
  weight_control: "kiểm soát cân nặng",
  premium: "chế độ cao cấp",
  // Needs Cat Additional
  hairball: "ngừa búi lông (hairball)",
  weight_loss: "giảm cân",
  multi_cat: "nhà đông mèo",
  // Budgets
  under_500k: "dưới 500k/tháng",
  "500k_1m": "500k–1 triệu/tháng",
  "1m_2m": "1–2 triệu/tháng",
  over_2m: "trên 2 triệu/tháng",
};

export async function getMockPetAdvice(data: QuizData): Promise<AiResultData> {
  // Simulate network latency of 1.5 seconds
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const isCat = data.answers.pet_type === "cat" || data.pet_type === "cat";
  const age = data.answers.age_group || "";
  const breed = data.answers.breed || "";
  const need = data.answers.need || "";
  const budget = data.answers.budget || "";
  const food = data.answers.current_food || "";

  // Helper to get labels
  const getLabel = (val: string) => labelsMap[val] || val;

  // 1. SPECIFIC CASE: Mèo + Kén ăn
  if (isCat && need === "picky_eater") {
    return {
      summary: `Bé là mèo ${getLabel(age)}, giống ${getLabel(breed)}, nhu cầu chính là ${getLabel(need)}, ngân sách ${getLabel(budget)}.`,
      advice: "3F AI gợi ý anh/chị ưu tiên hạt có mùi thơm, dễ tiêu hóa, kết hợp pate hoặc topper để tăng độ ngon miệng.",
      recommended_products: [
        {
          id: 1, /*  */
          reason: "Phù hợp với mèo adult và nhu cầu kén ăn."
        },
        {
          id: 1, /*  */
          reason: "Giúp tăng mùi vị, hỗ trợ bé ăn ngon và nạp đủ dinh dưỡng."
        },
        {
          id: 1, /*  */
          reason: "Phù hợp nếu bé đổi thức ăn hoặc ăn uống thất thường."
        }
      ],
      care_tips: [
        "Nếu đổi thức ăn, nên trộn dần thức ăn mới với cũ trong 5–7 ngày.",
        "Theo dõi phân và khẩu vị của bé trong tuần đầu."
      ],
      warning: "",
      voucher_code: "3F30K"
    };
  }

  // 2. SPECIFIC CASE: Chó + Kén ăn
  if (!isCat && need === "picky_eater") {
    return {
      summary: `Bé là cún ${getLabel(age)}, giống ${getLabel(breed)}, nhu cầu chính là ${getLabel(need)}, ngân sách ${getLabel(budget)}.`,
      advice: "3F AI gợi ý anh/chị sử dụng các loại hạt sấy thăng hoa (freeze-dried) hoặc hạt trộn thịt sấy để tăng cường hương vị thơm ngon tự nhiên cho cún.",
      recommended_products: [
        {
          id: 1, /*  */
          reason: "Tăng mùi thơm từ thịt thật giúp cún kén ăn bắt đầu chịu ăn ngon lành."
        },
        {
          id: 1, /*  */
          reason: "Trộn trực tiếp với hạt khô để làm mềm hạt và kích thích ăn tốt hơn."
        }
      ],
      care_tips: [
        "Tránh cho ăn vặt quá nhiều trước bữa chính khiến cún lơ là bữa ăn.",
        "Giới hạn thời gian ăn trong vòng 20 phút, nếu bé không ăn hãy cất đi để tạo thói quen."
      ],
      warning: "",
      voucher_code: "3F30K"
    };
  }

  // 3. SPECIFIC CASE: Mèo con / Chó con (Dưới 6/12 tháng)
  const isPuppyOrKitten = age === "under_6_months" || age === "6_12_months" || age === "kitten_under_12";
  if (isPuppyOrKitten) {
    return {
      summary: `Bé ${isCat ? "mèo" : "cún"} con ${getLabel(age)}, giống ${getLabel(breed)}, nhu cầu chính là ${getLabel(need) || "ăn hàng ngày"}.`,
      advice: `3F AI gợi ý cung cấp chế độ ăn giàu protein, canxi và các chất béo tốt để phát triển toàn diện hệ xương và cơ bắp trong giai đoạn vàng này.`,
      recommended_products: [
        {
          id: 1, /*  */
          reason: "Hàm lượng dinh dưỡng đậm đặc giúp bé lớn nhanh và khỏe mạnh."
        },
        {
          id: 1, /*  */
          reason: "Bổ sung dinh dưỡng dễ hấp thu, hỗ trợ hệ miễn dịch của bé."
        }
      ],
      care_tips: [
        "Chia nhỏ thành 3-4 bữa/ngày vì dạ dày của bé lúc này còn khá nhỏ.",
        "Có thể ngâm hạt với nước ấm hoặc sữa cho mềm trước khi cho ăn."
      ],
      warning: "",
      voucher_code: "3F30K"
    };
  }

  // 4. DEFAULT FALLBACK
  return {
    summary: `Hồ sơ của bé: ${isCat ? "Mèo" : "Cún"} giống ${getLabel(breed)}, độ tuổi ${getLabel(age)}, nhu cầu ${getLabel(need) || "ăn uống hàng ngày"}, ngân sách ${getLabel(budget)}.`,
    advice: `Dựa trên thông tin anh/chị cung cấp, 3F AI gợi ý chế độ ăn cân bằng dinh dưỡng, tối ưu hóa theo nhu cầu sức khỏe hiện tại của bé cưng.`,
    recommended_products: [
      {
        id: 1, /*  */
        reason: "Cung cấp dinh dưỡng chuẩn xác, đầy đủ vitamin và khoáng chất."
      },
      {
        id: 1, /*  */
        reason: "Cải thiện độ ngon miệng và bổ sung nước cho hệ tiết niệu của bé."
      }
    ],
    care_tips: [
      "Luôn chuẩn bị sẵn nước sạch và thay mới mỗi ngày cho bé cưng.",
      "Tăng hoặc giảm lượng hạt ăn mỗi ngày tùy thuộc vào mức độ vận động của bé."
    ],
    warning: "",
    voucher_code: "3F30K"
  };
}

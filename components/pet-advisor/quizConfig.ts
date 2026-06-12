export interface QuizOption {
  label: string;
  value: string;
  estimatedAmount?: number;
  months?: number;
}

export interface QuizStepConfig {
  id: string;
  question: string;
  type: "single_choice" | "multi_choice" | "text_input" | "textarea";
  placeholder?: string;
  options?: QuizOption[];
  customInputTrigger?: string; // e.g. "other" -> show text input below choices
  customInputPlaceholder?: string;
  description?: string;
  required?: boolean;
  quickOptions?: string[];
}

export const dogQuizSteps: QuizStepConfig[] = [
  {
    id: "problem_text",
    type: "textarea",
    question: "Bé nhà mình đang gặp vấn đề gì hiện tại?",
    description: "Mô tả ngắn tình trạng của bé để chuyên gia tư vấn chính xác hơn.",
    placeholder: "Ví dụ: bé kén ăn, hay ói, đi phân mềm, rụng lông, tiểu ít, hơi gầy...",
    required: true,
    quickOptions: [
      "Kén ăn",
      "Tiêu hóa yếu",
      "Rụng lông",
      "Tiết niệu",
      "Tăng cân",
      "Giảm cân",
      "Hairball",
      "Chưa rõ vấn đề"
    ]
  },
  {
    id: "age_group",
    question: "Bé chó đang ở giai đoạn nào?",
    type: "single_choice",
    options: [
      { label: "Dưới 6 tháng", value: "under_6_months" },
      { label: "6–12 tháng", value: "6_12_months" },
      { label: "1–7 tuổi", value: "adult_1_7" },
      { label: "Trên 7 tuổi", value: "senior_7_plus" }
    ]
  },
  {
    id: "breed",
    question: "Bé thuộc giống nào?",
    type: "single_choice",
    options: [
      { label: "Poodle", value: "poodle" },
      { label: "Pomeranian", value: "pomeranian" },
      { label: "Corgi", value: "corgi" },
      { label: "Golden", value: "golden" },
      { label: "Husky", value: "husky" },
      { label: "Chihuahua", value: "chihuahua" },
      { label: "Khác", value: "other" },
      { label: "Không rõ", value: "unknown" }
    ],
    customInputTrigger: "other",
    customInputPlaceholder: "Nhập giống chó của bé"
  },
  {
    id: "weight_range",
    question: "Bé nặng khoảng bao nhiêu kg?",
    type: "single_choice",
    options: [
      { label: "Dưới 2kg", value: "under_2kg" },
      { label: "2–5kg", value: "2_5kg" },
      { label: "5–10kg", value: "5_10kg" },
      { label: "10–20kg", value: "10_20kg" },
      { label: "Trên 20kg", value: "over_20kg" },
      { label: "Không rõ", value: "unknown" }
    ]
  },
  {
    id: "coat_type",
    question: "Lông của bé thuộc loại nào?",
    type: "single_choice",
    options: [
      { label: "Ngắn", value: "short" },
      { label: "Dài", value: "long" },
      { label: "Rụng nhiều", value: "shedding" },
      { label: "Không rõ", value: "unknown" }
    ]
  },
  {
    id: "need",
    question: "Xác nhận thêm nhu cầu",
    description: "Chuyên gia sẽ dựa trên mô tả của anh/chị để nhận diện nhu cầu. Anh/chị có thể chọn thêm nhóm phù hợp nếu đúng:",
    type: "multi_choice",
    options: [
      { label: "Ăn hằng ngày", value: "daily" },
      { label: "Kén ăn", value: "picky_eater" },
      { label: "Tiêu hóa", value: "digestion" },
      { label: "Da lông", value: "skin_coat" },
      { label: "Tiết niệu", value: "urinary" },
      { label: "Tăng cân", value: "gain_weight" },
      { label: "Giảm cân", value: "weight_loss" },
      { label: "Hairball", value: "hairball" },
      { label: "Đa mèo", value: "multi_cat" },
      { label: "Cao cấp", value: "premium" },
      { label: "Khác", value: "other" }
    ]
  },
  {
    id: "current_food",
    question: "Hiện tại bé đang ăn loại nào?",
    type: "multi_choice",
    options: [
      { label: "Royal Canin", value: "royal_canin" },
      { label: "SmartHeart", value: "smart_heart" },
      { label: "Pedigree", value: "pedigree" },
      { label: "Thức ăn tự nấu", value: "home_cooked" },
      { label: "Khác", value: "other" }
    ],
    customInputTrigger: "other",
    customInputPlaceholder: "Nhập tên thức ăn hiện tại của bé"
  },
  {
    id: "purchase_amount_range",
    type: "single_choice",
    question: "Mỗi lần anh/chị thường mua khoảng bao nhiêu tiền cho bé?",
    description: "Thông tin này giúp 3F hiểu thói quen mua sắm thực tế, không nhầm với ngân sách mỗi tháng.",
    options: [
      { label: "Dưới 200K", value: "under_200k", estimatedAmount: 150000 },
      { label: "200K – 500K", value: "200k_500k", estimatedAmount: 350000 },
      { label: "500K – 1 triệu", value: "500k_1m", estimatedAmount: 750000 },
      { label: "1 – 2 triệu", value: "1m_2m", estimatedAmount: 1500000 },
      { label: "Trên 2 triệu", value: "over_2m", estimatedAmount: 2500000 }
    ]
  },
  {
    id: "usage_duration_range",
    type: "single_choice",
    question: "Số sản phẩm đó thường dùng được trong bao lâu?",
    description: "Chuyên gia sẽ tính ngân sách thực tế mỗi tháng để tư vấn đúng phân khúc hơn.",
    options: [
      { label: "Dưới 1 tháng", value: "under_1m", months: 0.5 },
      { label: "Khoảng 1 tháng", value: "1m", months: 1 },
      { label: "2 tháng", value: "2m", months: 2 },
      { label: "3 – 4 tháng", value: "3_4m", months: 3.5 },
      { label: "Trên 4 tháng", value: "over_4m", months: 4.5 }
    ]
  }
];

export const catQuizSteps: QuizStepConfig[] = [
  {
    id: "problem_text",
    type: "textarea",
    question: "Bé nhà mình đang gặp vấn đề gì hiện tại?",
    description: "Mô tả ngắn tình trạng của bé để chuyên gia tư vấn chính xác hơn.",
    placeholder: "Ví dụ: bé kén ăn, hay ói, đi phân mềm, rụng lông, tiểu ít, hơi gầy...",
    required: true,
    quickOptions: [
      "Kén ăn",
      "Tiêu hóa yếu",
      "Rụng lông",
      "Tiết niệu",
      "Tăng cân",
      "Giảm cân",
      "Hairball",
      "Chưa rõ vấn đề"
    ]
  },
  {
    id: "age_group",
    question: "Bé mèo đang ở giai đoạn nào?",
    type: "single_choice",
    options: [
      { label: "Kitten - dưới 12 tháng", value: "kitten_under_12" },
      { label: "Adult - 1 đến 7 tuổi", value: "adult_1_7" },
      { label: "Senior - trên 7 tuổi", value: "senior_7_plus" },
      { label: "Không rõ", value: "unknown" }
    ]
  },
  {
    id: "breed",
    question: "Bé thuộc giống nào?",
    type: "single_choice",
    options: [
      { label: "Anh lông ngắn", value: "british_shorthair" },
      { label: "Ba Tư", value: "persian" },
      { label: "Munchkin", value: "munchkin" },
      { label: "Maine Coon", value: "maine_coon" },
      { label: "Scottish", value: "scottish" },
      { label: "Mèo ta", value: "vietnamese_common" },
      { label: "Khác", value: "other" },
      { label: "Không rõ", value: "unknown" }
    ],
    customInputTrigger: "other",
    customInputPlaceholder: "Nhập giống mèo của bé"
  },
  {
    id: "coat_type",
    question: "Lông của bé thuộc loại nào?",
    type: "single_choice",
    options: [
      { label: "Ngắn", value: "short" },
      { label: "Dài", value: "long" },
      { label: "Rụng nhiều", value: "shedding" },
      { label: "Không rõ", value: "unknown" }
    ]
  },
  {
    id: "need",
    question: "Xác nhận thêm nhu cầu",
    description: "Chuyên gia sẽ dựa trên mô tả của anh/chị để nhận diện nhu cầu. Anh/chị có thể chọn thêm nhóm phù hợp nếu đúng:",
    type: "multi_choice",
    options: [
      { label: "Ăn hằng ngày", value: "daily" },
      { label: "Kén ăn", value: "picky_eater" },
      { label: "Tiêu hóa", value: "digestion" },
      { label: "Da lông", value: "skin_coat" },
      { label: "Tiết niệu", value: "urinary" },
      { label: "Tăng cân", value: "gain_weight" },
      { label: "Giảm cân", value: "weight_loss" },
      { label: "Hairball", value: "hairball" },
      { label: "Đa mèo", value: "multi_cat" },
      { label: "Cao cấp", value: "premium" },
      { label: "Khác", value: "other" }
    ]
  },
  {
    id: "pet_count",
    question: "Anh/chị đang nuôi bao nhiêu bé mèo?",
    type: "single_choice",
    options: [
      { label: "1 bé", value: "1_pet" },
      { label: "2 bé", value: "2_pets" },
      { label: "3–5 bé", value: "3_5_pets" },
      { label: "Trên 5 bé", value: "over_5_pets" }
    ]
  },
  {
    id: "neutered_status",
    question: "Bé đã triệt sản chưa?",
    type: "single_choice",
    options: [
      { label: "Đã triệt sản", value: "neutered" },
      { label: "Chưa triệt sản", value: "not_neutered" },
      { label: "Không rõ", value: "unknown" }
    ]
  },
  {
    id: "current_food",
    question: "Hiện tại bé đang ăn loại nào?",
    type: "multi_choice",
    options: [
      { label: "Royal Canin", value: "royal_canin" },
      { label: "Whiskas", value: "whiskas" },
      { label: "Me-O", value: "me_o" },
      { label: "Catsrang", value: "catsrang" },
      { label: "Thức ăn tự nấu", value: "home_cooked" },
      { label: "Khác", value: "other" }
    ],
    customInputTrigger: "other",
    customInputPlaceholder: "Nhập tên thức ăn hiện tại của bé"
  },
  {
    id: "purchase_amount_range",
    type: "single_choice",
    question: "Mỗi lần anh/chị thường mua khoảng bao nhiêu tiền cho bé?",
    description: "Thông tin này giúp 3F hiểu thói quen mua sắm thực tế, không nhầm với ngân sách mỗi tháng.",
    options: [
      { label: "Dưới 200K", value: "under_200k", estimatedAmount: 150000 },
      { label: "200K – 500K", value: "200k_500k", estimatedAmount: 350000 },
      { label: "500K – 1 triệu", value: "500k_1m", estimatedAmount: 750000 },
      { label: "1 – 2 triệu", value: "1m_2m", estimatedAmount: 1500000 },
      { label: "Trên 2 triệu", value: "over_2m", estimatedAmount: 2500000 }
    ]
  },
  {
    id: "usage_duration_range",
    type: "single_choice",
    question: "Số sản phẩm đó thường dùng được trong bao lâu?",
    description: "Chuyên gia sẽ tính ngân sách thực tế mỗi tháng để tư vấn đúng phân khúc hơn.",
    options: [
      { label: "Dưới 1 tháng", value: "under_1m", months: 0.5 },
      { label: "Khoảng 1 tháng", value: "1m", months: 1 },
      { label: "2 tháng", value: "2m", months: 2 },
      { label: "3 – 4 tháng", value: "3_4m", months: 3.5 },
      { label: "Trên 4 tháng", value: "over_4m", months: 4.5 }
    ]
  }
];

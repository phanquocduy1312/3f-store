export type ConsultationRecord = {
  id: number;
  customer_id?: number;
  name?: string;
  species?: string;
  breed?: string;
  gender?: string;
  birthday?: string | null;
  weight_kg?: number | string | null;
  health_notes?: string;
  allergies?: string;
  favorite_food?: string;
  ai_result?: string | null;
  deleted_at?: string | null;
  created_at?: string | null;
  customer_full_name?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_status?: string;
};

export type AdvisorAnswer = {
  id?: string;
  question?: string;
  label?: string;
  value?: string;
};

export const speciesLabel: Record<string, string> = {
  cat: "Mèo",
  dog: "Chó",
  other: "Khác",
};

export function parseAdvice(value?: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function formatDate(value?: string | null) {
  if (!value) return "Chưa rõ";
  return new Date(value).toLocaleDateString("vi-VN");
}

export function formatMoney(value: unknown) {
  const amount = Number(value || 0);
  if (!amount) return "Chưa rõ";
  return `${amount.toLocaleString("vi-VN")} đ`;
}

export function listText(value: unknown, fallback = "Chưa cập nhật") {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || fallback;
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

export function findAnswer(answers: AdvisorAnswer[], id: string) {
  const answer = answers.find(item => item.id === id);
  return answer?.label || answer?.value || "";
}

export function getMeta(record: ConsultationRecord) {
  const parsed = parseAdvice(record.ai_result);
  const inputs = parsed?.advisor_inputs || {};
  const budget = parsed?.budget_analysis || {};
  const answers: AdvisorAnswer[] = Array.isArray(inputs.answers) ? inputs.answers : [];

  return {
    parsed,
    inputs,
    answers,
    customerName: record.customer_full_name || record.customer_name || inputs.customer?.name || "Chưa rõ tên",
    customerPhone: record.customer_phone || inputs.customer?.phone || "Chưa rõ",
    customerEmail: record.customer_email || inputs.customer?.email || "Chưa rõ",
    petName: record.name || inputs.customer?.petName || inputs.customer?.pet_name || inputs.pet_name || "Thú cưng",
    petType: speciesLabel[record.species || inputs.active_flow] || record.species || inputs.active_flow || "Chưa rõ",
    breed: record.breed || findAnswer(answers, "breed") || "Chưa rõ",
    age: findAnswer(answers, "age_group") || "Chưa rõ",
    weight: findAnswer(answers, "weight_range") || (record.weight_kg ? `${record.weight_kg} kg` : "Chưa rõ"),
    coatType: findAnswer(answers, "coat_type") || "Chưa rõ",
    petCount: findAnswer(answers, "pet_count") || "Không áp dụng",
    neutered: findAnswer(answers, "neutered_status") || "Không áp dụng",
    problem: inputs.problem_text || record.health_notes || findAnswer(answers, "problem_text") || "Chưa cập nhật",
    selectedNeeds: inputs.selected_needs || [],
    detectedNeeds: inputs.detected_needs || parsed?.detected_needs || [],
    currentFood: inputs.current_food || record.favorite_food || findAnswer(answers, "current_food") || "Chưa cập nhật",
    allergies: record.allergies || "Chưa cập nhật",
    purchaseAmount: inputs.purchase_amount_label || findAnswer(answers, "purchase_amount_range") || budget.purchase_amount_label || "Chưa rõ",
    usageDuration: inputs.usage_duration_label || findAnswer(answers, "usage_duration_range") || budget.usage_duration_label || "Chưa rõ",
    monthlyBudget: inputs.monthly_budget || budget.monthly_budget,
    budgetSegment: inputs.budget_segment || budget.budget_segment || "Chưa rõ",
    summary: parsed?.summary || "Chưa có tóm tắt AI",
    advice: parsed?.advice || "Chưa có lời khuyên AI",
    warning: parsed?.warning || "",
  };
}

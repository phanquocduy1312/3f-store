export function detectNeeds(problemText: string): string[] {
  const text = (problemText || "").toLowerCase();
  const needs: string[] = [];

  if (
    text.includes("ăn ít") ||
    text.includes("bỏ ăn") ||
    text.includes("kén ăn") ||
    text.includes("không chịu ăn") ||
    text.includes("chán ăn")
  ) {
    needs.push("Kén ăn");
  }

  if (
    text.includes("ói") ||
    text.includes("nôn") ||
    text.includes("tiêu chảy") ||
    text.includes("phân mềm") ||
    text.includes("đi ngoài")
  ) {
    needs.push("Tiêu hóa");
  }

  if (
    text.includes("rụng lông") ||
    text.includes("lông xấu") ||
    text.includes("ngứa") ||
    text.includes("da khô")
  ) {
    needs.push("Da lông");
  }

  if (
    text.includes("tiểu ít") ||
    text.includes("tiểu khó") ||
    text.includes("sỏi") ||
    text.includes("viêm đường tiểu") ||
    text.includes("đường tiểu")
  ) {
    needs.push("Tiết niệu");
  }

  if (
    text.includes("gầy") ||
    text.includes("tăng cân") ||
    text.includes("tăng ký") ||
    text.includes("mập lên")
  ) {
    needs.push("Tăng cân");
  }

  if (
    text.includes("béo") ||
    text.includes("thừa cân") ||
    text.includes("giảm cân")
  ) {
    needs.push("Kiểm soát cân nặng");
  }

  if (
    text.includes("búi lông") ||
    text.includes("hairball") ||
    text.includes("nôn lông")
  ) {
    needs.push("Hairball");
  }

  if (
    text.includes("hôi miệng") ||
    text.includes("răng") ||
    text.includes("nướu")
  ) {
    needs.push("Răng miệng");
  }

  return Array.from(new Set(needs.length > 0 ? needs : ["Khác"]));
}

export function detectSeriousWarning(problemText: string): boolean {
  const text = (problemText || "").toLowerCase();

  return (
    text.includes("bỏ ăn nhiều ngày") ||
    text.includes("nôn liên tục") ||
    text.includes("ói liên tục") ||
    text.includes("tiêu chảy kéo dài") ||
    text.includes("tiểu ra máu") ||
    text.includes("khó thở") ||
    text.includes("co giật") ||
    text.includes("mệt lả")
  );
}

export function calculateMonthlyBudget(
  estimatedPurchaseAmount: number,
  usageDurationMonths: number
): number {
  if (!estimatedPurchaseAmount || !usageDurationMonths) return 0;
  return Math.round(estimatedPurchaseAmount / usageDurationMonths);
}

export function getBudgetSegment(monthlyBudget: number): string {
  if (monthlyBudget < 150000) return "Tiết kiệm";
  if (monthlyBudget < 300000) return "Phổ thông";
  if (monthlyBudget < 600000) return "Cân bằng";
  if (monthlyBudget < 1000000) return "Tốt";
  return "Cao cấp";
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

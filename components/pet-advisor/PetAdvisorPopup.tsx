import { useState, useEffect } from "react";
import { X, PawPrint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { QuizWelcome } from "./QuizWelcome";
import { QuizStep } from "./QuizStep";
import { ContactForm } from "./ContactForm";
import { AiLoading } from "./AiLoading";
import { AiResult } from "./AiResult";
import { ProgressBar } from "./ProgressBar";
import { Mascot } from "./Mascot";
import { dogQuizSteps, catQuizSteps } from "./quizConfig";
import { AiResultData } from "./mockAiResult";
import { getPetAdviceFromGroq } from "./groqApi";
import { detectNeeds, detectSeriousWarning, calculateMonthlyBudget, getBudgetSegment } from "./petAdvisorUtils";

const CLOSED_KEY = "pet_popup_closed_at";
const SUBMITTED_KEY = "pet_quiz_submitted_at";
const STORAGE_KEY = "pet_advisor_state_v2"; // use versioned key to isolate state cleanly

function trackEvent(eventName: string, payload = {}) {
  console.log("[TRACK]", eventName, payload);
}

const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.version === "2.0") return parsed;
    }
  } catch (e) {
    console.error("Failed to load pet advisor state", e);
  }
  return null;
};

export function PetAdvisorPopup() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  
  const initialState = loadState() || {};
  const [status, setStatus] = useState<"welcome" | "pet_type" | "both_which" | "quiz" | "contact" | "loading" | "result">(initialState.status || "welcome");
  const [overallPetType, setOverallPetType] = useState<"dog" | "cat" | "both" | null>(initialState.overallPetType || null);
  const [activeFlow, setActiveFlow] = useState<"dog" | "cat" | null>(initialState.activeFlow || null);
  const [currentStep, setCurrentStep] = useState(initialState.currentStep || 0);
  const [answers, setAnswers] = useState<Record<string, { value: string | string[]; customText?: string }>>(initialState.answers || {});
  const [customer, setCustomer] = useState<{ name: string; phone: string; email: string; petName?: string } | null>(initialState.customer || null);
  const [aiResult, setAiResult] = useState<AiResultData | null>(initialState.aiResult || null);

  // Sync state
  useEffect(() => {
    const problemText = (answers.problem_text?.value as string) || "";
    const detectedNeeds = detectNeeds(problemText);
    const hasSeriousWarning = detectSeriousWarning(problemText);

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

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: "2.0",
      status, overallPetType, activeFlow, currentStep, answers, customer, aiResult,
      computed: {
        detected_needs: detectedNeeds,
        has_serious_warning: hasSeriousWarning,
        estimated_purchase_amount: estimatedAmt,
        usage_duration_months: months,
        monthly_budget: monthlyBudget,
        budget_segment: budgetSegment
      }
    }));
  }, [status, overallPetType, activeFlow, currentStep, answers, customer, aiResult]);

  const steps = activeFlow === "dog" ? dogQuizSteps : catQuizSteps;

  // Trigger popup
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
      setShowFloat(false);
      trackEvent("pet_advisor_open", { trigger: "header_button" });
    };
    window.addEventListener("open-pet-advisor", handleOpenEvent);

    const timer = setTimeout(() => {
      setIsOpen(true);
      trackEvent("pet_advisor_open", { trigger: "timeout" });
    }, 7000);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("open-pet-advisor", handleOpenEvent);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setShowFloat(true);
    sessionStorage.setItem(CLOSED_KEY, String(Date.now()));
    trackEvent("popup_close", { status });
  };

  const handleRestart = () => {
    setStatus("welcome");
    setOverallPetType(null);
    setActiveFlow(null);
    setCurrentStep(0);
    setAnswers({});
    setAiResult(null);
    trackEvent("quiz_restart");
  };

  const handleStartQuiz = () => {
    setStatus("pet_type");
    trackEvent("quiz_start");
  };

  const handleSelectPetType = (type: "dog" | "cat" | "both") => {
    setOverallPetType(type);
    trackEvent("pet_advisor_pet_type_selected", { type });
    if (type === "both") {
      setStatus("both_which");
    } else {
      setActiveFlow(type);
      setStatus("quiz");
      setCurrentStep(0);
    }
  };

  const handleStepSubmit = (value: string | string[], customText?: string) => {
    const currentStepConfig = steps[currentStep];
    const newAnswers = { ...answers, [currentStepConfig.id]: { value, customText } };
    setAnswers(newAnswers);

    // Track detailed step metrics
    if (currentStepConfig.id === "problem_text") {
      trackEvent("pet_advisor_problem_entered", { problem: value });
    } else if (currentStepConfig.id === "purchase_amount_range") {
      trackEvent("pet_advisor_purchase_amount_selected", { amount: value });
    } else if (currentStepConfig.id === "usage_duration_range") {
      trackEvent("pet_advisor_usage_duration_selected", { duration: value });
    } else {
      trackEvent("quiz_step_completed", { stepId: currentStepConfig.id, value, customText });
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setStatus("contact");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setStatus(overallPetType === "both" ? "both_which" : "pet_type");
    }
  };

  const handleContactSubmit = async (info: { name: string; phone: string; email: string; petName?: string }) => {
    setCustomer(info);
    setStatus("loading");
    trackEvent("pet_advisor_contact_submitted", info);

    try {
      const result = await getPetAdviceFromGroq(
        answers,
        overallPetType || "dog",
        activeFlow,
        info
      );
      setAiResult(result);
      setStatus("result");
      localStorage.setItem(SUBMITTED_KEY, String(Date.now()));
      trackEvent("pet_advisor_result_viewed", { summary: result.summary });
    } catch (e) {
      console.error(e);
      setStatus("contact");
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={handleClose} />
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="bg-white shadow-2xl relative z-10 w-full overflow-hidden flex flex-col md:flex-row
                max-h-[90vh] md:max-h-[620px] 
                rounded-2xl md:rounded-3xl max-w-[calc(100vw-32px)] md:max-w-[720px] mx-auto"
            >
              <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-30" aria-label="Close">
                <X size={24} />
              </button>

              <div className={`w-full md:w-[45%] md:flex items-center justify-center p-6 relative overflow-hidden select-none border-b md:border-b-0 md:border-r border-gray-100
                ${status === "welcome" ? "flex min-h-[200px]" : "hidden md:flex"}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-blue-50/50 to-blue-200/30"></div>
                
                <div className="absolute inset-0 pointer-events-none overflow-hidden text-blue-300/40">
                  <PawPrint className="absolute top-6 left-6 rotate-[-25deg]" size={36} fill="currentColor" />
                  <PawPrint className="absolute top-32 left-12 rotate-[15deg]" size={24} fill="currentColor" />
                  <PawPrint className="absolute bottom-20 left-8 rotate-[35deg]" size={48} fill="currentColor" />
                  <PawPrint className="absolute bottom-8 right-12 rotate-[-15deg]" size={32} fill="currentColor" />
                  <PawPrint className="absolute top-12 right-10 rotate-[20deg]" size={40} fill="currentColor" />
                  <PawPrint className="absolute top-1/2 right-4 rotate-[-40deg]" size={24} fill="currentColor" />
                </div>

                <Mascot thinking={status === "loading"} className="max-h-[160px] md:max-h-[280px] drop-shadow-2xl relative z-10" />
              </div>

              <div className="w-full md:w-[55%] p-6 md:p-8 flex flex-col justify-center min-h-[360px] overflow-y-auto bg-white">
                {status === "quiz" && <ProgressBar current={currentStep + 1} total={steps.length} />}
                
                <AnimatePresence mode="wait">
                  {status === "welcome" && <QuizWelcome onStart={handleStartQuiz} />}
                  
                  {status === "pet_type" && (
                    <motion.div key="pet_type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center md:text-left">
                      <h4 className="text-[18px] md:text-[20px] font-black text-ink">Anh/chị đang nuôi bé nào?</h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        <button onClick={() => handleSelectPetType("dog")} className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-forest text-left transition-all font-bold flex items-center justify-between text-ink hover:bg-cream-soft/20">
                          <span>🐶 Bé Cún (Chó)</span>
                          <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center shrink-0">→</span>
                        </button>
                        <button onClick={() => handleSelectPetType("cat")} className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-forest text-left transition-all font-bold flex items-center justify-between text-ink hover:bg-cream-soft/20">
                          <span>🐱 Bé Mèo</span>
                          <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center shrink-0">→</span>
                        </button>
                        <button onClick={() => handleSelectPetType("both")} className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-forest text-left transition-all font-bold flex items-center justify-between text-ink hover:bg-cream-soft/20">
                          <span>🐶🐱 Cả Hai bé</span>
                          <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center shrink-0">→</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {status === "both_which" && (
                    <motion.div key="both_which" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center md:text-left">
                      <h4 className="text-[18px] md:text-[20px] font-black text-ink">Anh/chị muốn tư vấn bé nào trước?</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => { setActiveFlow("dog"); setStatus("quiz"); setCurrentStep(0); }} className="p-4 rounded-2xl border-2 border-gray-200 hover:border-forest font-bold text-center text-ink flex flex-col items-center gap-2">
                          <span className="text-3xl">🐶</span>
                          <span>Bé Cún</span>
                        </button>
                        <button onClick={() => { setActiveFlow("cat"); setStatus("quiz"); setCurrentStep(0); }} className="p-4 rounded-2xl border-2 border-gray-200 hover:border-forest font-bold text-center text-ink flex flex-col items-center gap-2">
                          <span className="text-3xl">🐱</span>
                          <span>Bé Mèo</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {status === "quiz" && (
                    <QuizStep key={`step-${currentStep}`} stepConfig={steps[currentStep]} savedAnswer={answers[steps[currentStep].id]} onBack={handleBack} onNext={handleStepSubmit} />
                  )}

                  {status === "contact" && (
                    <ContactForm key="contact" onBack={() => { setStatus("quiz"); setCurrentStep(steps.length - 1); }} onSubmit={handleContactSubmit} />
                  )}

                  {status === "loading" && <AiLoading key="loading" />}

                  {status === "result" && aiResult && (
                    <AiResult key="result" result={aiResult}
                      onExploreProducts={() => { handleClose(); trackEvent("pet_advisor_product_clicked", { action: "explore" }); navigate(`/products?category=${activeFlow === "dog" ? "Thức ăn cho chó" : "Thức ăn cho mèo"}`); }}
                      onConsultAgent={() => { handleClose(); trackEvent("pet_advisor_zalo_clicked", { type: "chat" }); window.open("https://zalo.me/your_number", "_blank"); }}
                      onShareZalo={() => { trackEvent("pet_advisor_zalo_clicked", { type: "share" }); window.open(`https://zalo.me/your_number?text=${encodeURIComponent("Tôi vừa nhận được tư vấn cho thú cưng từ 3F: " + aiResult.summary)}`, "_blank"); }}
                      onClose={handleClose}
                      onRestart={handleRestart}
                      onCopyVoucher={() => trackEvent("pet_advisor_voucher_claimed", { code: aiResult.voucher_code })}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

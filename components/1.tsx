import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Calendar,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Gift,
  PawPrint,
  Percent,
  Star,
} from "lucide-react";

export type ThreeFClubAssets = Partial<{
  badgeSilver: string;
  badgeGold: string;
  badgePlatinum: string;
  petHero: string;
  pawBlue: string;
  pawLight: string;
  pointsIcon: string;
  giftIcon: string;
  discountIcon: string;
  petProfileIcon: string;
  ticketIcon: string;
  calendarIcon: string;
  couponIcon: string;
}>;

export type ThreeFClubProps = {
  className?: string;
  assets?: ThreeFClubAssets;
  onJoin?: () => void;
  onLearnMore?: () => void;
  onSilverClick?: () => void;
  onGoldClick?: () => void;
  onPlatinumClick?: () => void;
};

const DEFAULT_ASSETS: ThreeFClubAssets = {
  badgeSilver: "/assets/3f-club/badge_silver.png",
  badgeGold: "/assets/3f-club/badge_gold.png",
  badgePlatinum: "/assets/3f-club/badge_platinum.png",
  petHero: "/assets/3f-club/ref_pet_hero_transparent_attempt.png",
  pawBlue: "/assets/3f-club/icon_paw_blue.png",
  pawLight: "/assets/3f-club/icon_paw_light.png",
  pointsIcon: "/assets/3f-club/icon_points.png",
  giftIcon: "/assets/3f-club/icon_gift.png",
  discountIcon: "/assets/3f-club/icon_discount_tag.png",
  petProfileIcon: "/assets/3f-club/icon_pet_profile.png",
  ticketIcon: "/assets/3f-club/icon_ticket_star.png",
  calendarIcon: "/assets/3f-club/icon_calendar_clock.png",
  couponIcon: "/assets/3f-club/icon_coupon_percent.png",
};

type AssetOrIconProps = {
  src?: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
};

function AssetOrIcon({ src, alt, className, fallback }: AssetOrIconProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className={`${className ?? ""} three-f-fallback-icon`} aria-hidden="true">
        {fallback}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

type TierTone = "silver" | "gold" | "platinum";

type Tier = {
  tone: TierTone;
  name: string;
  range: string;
  badge?: string;
  recommended?: boolean;
  action: string;
  benefits: string[];
};

const TIER_STYLE: Record<TierTone, CSSProperties> = {
  silver: {
    "--tier": "#d5dce7",
    "--tier-strong": "#6f839a",
    "--tier-text": "#526d88",
    "--tier-soft": "#eff3f8",
    "--tier-chip": "#e4e9f1",
    "--tier-shadow": "rgba(84, 112, 142, 0.28)",
    "--tier-border": "rgba(147, 166, 188, 0.55)",
  } as CSSProperties,
  gold: {
    "--tier": "#f8b928",
    "--tier-strong": "#df9300",
    "--tier-text": "#d99500",
    "--tier-soft": "#fff8dc",
    "--tier-chip": "#fff0b8",
    "--tier-shadow": "rgba(255, 171, 0, 0.38)",
    "--tier-border": "rgba(255, 187, 33, 0.95)",
  } as CSSProperties,
  platinum: {
    "--tier": "#2048e6",
    "--tier-strong": "#2436c8",
    "--tier-text": "#135bd8",
    "--tier-soft": "#f0f5ff",
    "--tier-chip": "#e6e8ff",
    "--tier-shadow": "rgba(49, 91, 233, 0.34)",
    "--tier-border": "rgba(108, 140, 246, 0.58)",
  } as CSSProperties,
};

function TierCard({
  tier,
  fallbackIcon,
  onClick,
}: {
  tier: Tier;
  fallbackIcon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <article
      className={`three-f-tier-card three-f-tier-${tier.tone}`}
      style={TIER_STYLE[tier.tone]}
    >
      {tier.recommended ? (
        <div className="three-f-ribbon" aria-label="Được đề xuất">
          <Star size={17} fill="currentColor" strokeWidth={2.2} />
          <span>ĐƯỢC ĐỀ XUẤT</span>
        </div>
      ) : null}

      <div className="three-f-tier-heading">
        <div className="three-f-tier-badge">
          <AssetOrIcon
            src={tier.badge}
            alt={`Huy hiệu ${tier.name}`}
            className="three-f-tier-badge-img"
            fallback={fallbackIcon}
          />
        </div>

        <div>
          <h3>{tier.name}</h3>
          <p>{tier.range}</p>
        </div>
      </div>

      <div className="three-f-card-line" />

      <ul className="three-f-tier-benefits">
        {tier.benefits.map((benefit) => (
          <li key={benefit}>
            <span className="three-f-check">
              <Check size={16} strokeWidth={4} />
            </span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <button
        className="three-f-tier-action"
        type="button"
        onClick={onClick}
      >
        {tier.action}
      </button>
    </article>
  );
}

function ThreeFClub({
  className,
  assets,
  onJoin,
  onLearnMore,
  onSilverClick,
  onGoldClick,
  onPlatinumClick,
}: ThreeFClubProps) {
  const a = { ...DEFAULT_ASSETS, ...assets };

  const tiers: Tier[] = [
    {
      tone: "silver",
      name: "SILVER",
      range: "0 - 1.999 điểm",
      badge: a.badgeSilver,
      action: "Đăng ký ngay",
      benefits: [
        "Tích điểm mỗi đơn hàng",
        "Voucher chào mừng",
        "Ưu đãi sinh nhật cho bé",
        "Nhận tư vấn AI",
      ],
    },
    {
      tone: "gold",
      name: "GOLD",
      range: "2.000 - 5.999 điểm",
      badge: a.badgeGold,
      recommended: true,
      action: "Tham gia Gold",
      benefits: [
        "Giảm thêm 3%",
        "Freeship đơn đủ điều kiện",
        "Quà sinh nhật hấp dẫn",
        "Ưu tiên ưu đãi độc quyền",
      ],
    },
    {
      tone: "platinum",
      name: "PLATINUM",
      range: "6.000+ điểm",
      badge: a.badgePlatinum,
      action: "Lên hạng Platinum",
      benefits: [
        "Giảm thêm 5%",
        "Freeship toàn quốc",
        "Quà VIP cho Boss",
        "Ưu tiên xử lý đơn hàng",
        "Ưu đãi riêng theo hồ sơ thú cưng",
      ],
    },
  ];

  const topBenefits = [
    {
      text: "100.000đ = 1 điểm",
      src: a.pointsIcon,
      fallback: <CircleDollarSign size={30} strokeWidth={2.4} />,
    },
    {
      text: "500 điểm = đổi quà hoặc voucher",
      src: a.giftIcon,
      fallback: <Gift size={32} strokeWidth={2.4} />,
    },
    {
      text: "Cashback đến 3%",
      src: a.discountIcon,
      fallback: <Percent size={31} strokeWidth={2.5} />,
    },
    {
      text: "Ưu đãi theo hồ sơ thú cưng",
      src: a.petProfileIcon,
      fallback: <PawPrint size={31} strokeWidth={2.5} />,
    },
  ];

  const sideBenefits = [
    {
      text: "Tích điểm tự động",
      src: a.pointsIcon,
      fallback: <CircleDollarSign size={30} strokeWidth={2.4} />,
    },
    {
      text: "Đổi quà linh hoạt",
      src: a.giftIcon,
      fallback: <Gift size={31} strokeWidth={2.4} />,
    },
    {
      text: "Ưu đãi thành viên mỗi tháng",
      src: a.ticketIcon,
      fallback: <Star size={31} strokeWidth={2.3} />,
    },
    {
      text: "Nhắc lịch mua lại & giao định kỳ",
      src: a.calendarIcon,
      fallback: (
        <span className="three-f-calendar-fallback">
          <Calendar size={30} strokeWidth={2.25} />
          <Clock size={17} strokeWidth={2.6} />
        </span>
      ),
    },
  ];

  return (
    <section className={`three-f-club ${className ?? ""}`} aria-labelledby="three-f-title">
      <style>{THREE_F_CLUB_STYLES}</style>

      <div className="three-f-shell">
        <span className="three-f-shape three-f-shape-left" />
        <span className="three-f-shape three-f-shape-right" />
        <span className="three-f-spark three-f-spark-1">✦</span>
        <span className="three-f-spark three-f-spark-2">✦</span>
        <span className="three-f-spark three-f-spark-3">✦</span>

        <span className="three-f-bg-paw three-f-bg-paw-1" aria-hidden="true">
          <AssetOrIcon
            src={a.pawLight}
            alt=""
            className="three-f-bg-paw-img"
            fallback={<PawPrint size={52} />}
          />
        </span>
        <span className="three-f-bg-paw three-f-bg-paw-2" aria-hidden="true">
          <AssetOrIcon
            src={a.pawLight}
            alt=""
            className="three-f-bg-paw-img"
            fallback={<PawPrint size={56} />}
          />
        </span>
        <span className="three-f-bg-paw three-f-bg-paw-3" aria-hidden="true">
          <AssetOrIcon
            src={a.pawBlue}
            alt=""
            className="three-f-bg-paw-img"
            fallback={<PawPrint size={49} />}
          />
        </span>
        <span className="three-f-bg-paw three-f-bg-paw-4" aria-hidden="true">
          <AssetOrIcon
            src={a.pawLight}
            alt=""
            className="three-f-bg-paw-img"
            fallback={<PawPrint size={45} />}
          />
        </span>

        <header className="three-f-header">
          <h2 id="three-f-title" className="three-f-brand" aria-label="3F Club">
            <span className="three-f-brand-3f">3F</span>
            <span className="three-f-brand-club">
              <span className="three-f-brand-c-wrap">
                <span className="three-f-brand-letter-c">C</span>
                <span className="three-f-brand-paw" aria-hidden="true">
                  <AssetOrIcon
                    src={a.pawBlue}
                    alt=""
                    className="three-f-brand-paw-img"
                    fallback={<PawPrint size={28} />}
                  />
                </span>
              </span>
              <span>lub</span>
            </span>
          </h2>

          <p className="three-f-subtitle">Thành viên càng mua, càng lợi</p>
          <p className="three-f-description">
            Tích điểm mỗi đơn hàng, nhận ưu đãi riêng cho Boss & Sen,
            <br />
            đổi quà và tiết kiệm nhiều hơn cùng 3F Store.
          </p>
        </header>

        <div className="three-f-benefit-strip" aria-label="Quyền lợi tổng quan">
          {topBenefits.map((benefit) => (
            <div className="three-f-benefit-pill" key={benefit.text}>
              <span className="three-f-benefit-icon">
                <AssetOrIcon
                  src={benefit.src}
                  alt=""
                  className="three-f-benefit-icon-img"
                  fallback={benefit.fallback}
                />
              </span>
              <span>{benefit.text}</span>
            </div>
          ))}
        </div>

        <div className="three-f-content">
          <div className="three-f-left">
            <div className="three-f-tier-grid">
              <TierCard
                tier={tiers[0]}
                onClick={onSilverClick}
                fallbackIcon={<PawPrint size={48} strokeWidth={2.2} />}
              />
              <TierCard
                tier={tiers[1]}
                onClick={onGoldClick}
                fallbackIcon={<PawPrint size={48} strokeWidth={2.2} />}
              />
              <TierCard
                tier={tiers[2]}
                onClick={onPlatinumClick}
                fallbackIcon={<PawPrint size={48} strokeWidth={2.2} />}
              />
            </div>

            <div className="three-f-cta">
              <div className="three-f-coupon">
                <AssetOrIcon
                  src={a.couponIcon}
                  alt=""
                  className="three-f-coupon-img"
                  fallback={<Percent size={42} strokeWidth={2.6} />}
                />
              </div>

              <p>
                Đăng ký 3F Club hôm nay
                <br />
                để nhận ngay voucher thành viên mới
              </p>

              <div className="three-f-cta-actions">
                <button className="three-f-cta-primary" type="button" onClick={onJoin}>
                  <span>Tham gia 3F Club</span>
                  <span className="three-f-button-circle">
                    <ChevronRight size={24} strokeWidth={3} />
                  </span>
                </button>

                <button className="three-f-cta-secondary" type="button" onClick={onLearnMore}>
                  <span>Tìm hiểu thêm</span>
                  <ChevronRight size={24} strokeWidth={2.8} />
                </button>
              </div>
            </div>
          </div>

          <aside className="three-f-side-card" aria-label="Tiện ích 3F Club">
            {sideBenefits.map((benefit) => (
              <div className="three-f-side-benefit" key={benefit.text}>
                <span className="three-f-side-icon">
                  <AssetOrIcon
                    src={benefit.src}
                    alt=""
                    className="three-f-side-icon-img"
                    fallback={benefit.fallback}
                  />
                </span>
                <span>{benefit.text}</span>
              </div>
            ))}
          </aside>
        </div>

        <div className="three-f-pets" aria-hidden="true">
          <span className="three-f-heart three-f-heart-1">♥</span>
          <span className="three-f-heart three-f-heart-2">♥</span>
          <span className="three-f-heart three-f-heart-3">♥</span>

          <AssetOrIcon
            src={a.petHero}
            alt=""
            className="three-f-pets-img"
            fallback={
              <span className="three-f-pets-fallback">
                <PawPrint size={70} />
              </span>
            }
          />
        </div>
      </div>
    </section>
  );
}

export { ThreeFClub };
export const ThreeFClup = ThreeFClub;
export default ThreeFClub;

const THREE_F_CLUB_STYLES = `
.three-f-club,
.three-f-club *,
.three-f-club *::before,
.three-f-club *::after {
  box-sizing: border-box;
}

@import url("https://fonts.googleapis.com/css2?family=Iosevka+Charon:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap");

.three-f-club {
  --three-f-blue: #075ed8;
  --three-f-blue-2: #0f7df2;
  --three-f-blue-dark: #0649b8;
  --three-f-text: #112a61;
  --three-f-muted: #3a4862;
  width: 100%;
  padding: 22px;
  font-family: "Be Vietnam Pro", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--three-f-text);
}

.three-f-shell {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  max-width: 1510px;
  min-height: 814px;
  margin: 0 auto;
  padding: 30px 42px 28px;
  border: 1px solid rgba(83, 126, 180, 0.42);
  border-radius: 34px;
  background:
    radial-gradient(circle at 8% 3%, rgba(218, 235, 255, 0.95) 0 160px, transparent 161px),
    radial-gradient(circle at 97% 100%, rgba(179, 214, 255, 0.95) 0 230px, transparent 232px),
    linear-gradient(120deg, #f8fbff 0%, #ffffff 42%, #f7fbff 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.78),
    0 22px 65px rgba(48, 103, 177, 0.13);
}

.three-f-shell::before {
  content: "";
  position: absolute;
  left: -96px;
  top: -134px;
  width: 412px;
  height: 412px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(211, 232, 255, 0.95), rgba(245, 250, 255, 0));
  z-index: -2;
}

.three-f-shell::after {
  content: "";
  position: absolute;
  right: -155px;
  bottom: -145px;
  width: 575px;
  height: 360px;
  border-radius: 55% 45% 0 0;
  background: linear-gradient(140deg, rgba(202, 226, 255, 0.98), rgba(135, 190, 255, 0.55));
  z-index: -2;
}

.three-f-shape {
  position: absolute;
  pointer-events: none;
  z-index: -1;
}

.three-f-shape-left {
  left: -42px;
  bottom: -98px;
  width: 245px;
  height: 210px;
  border-radius: 45% 60% 0 0;
  background: rgba(210, 232, 255, 0.92);
}

.three-f-shape-right {
  right: 205px;
  bottom: -62px;
  width: 415px;
  height: 178px;
  border-radius: 65% 45% 0 0;
  background: rgba(217, 235, 255, 0.65);
}

.three-f-spark {
  position: absolute;
  color: #8fbff8;
  font-weight: 900;
  pointer-events: none;
  text-shadow: 0 3px 12px rgba(20, 117, 232, 0.2);
}

.three-f-spark-1 {
  top: 59px;
  left: 255px;
  font-size: 40px;
}

.three-f-spark-2 {
  top: 48px;
  right: 135px;
  font-size: 25px;
}

.three-f-spark-3 {
  top: 60px;
  left: 66%;
  font-size: 20px;
}

.three-f-bg-paw {
  position: absolute;
  display: grid;
  place-items: center;
  color: #0f73e8;
  opacity: 0.16;
  pointer-events: none;
}

.three-f-bg-paw-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.three-f-bg-paw-1 {
  left: 82px;
  top: 84px;
  width: 60px;
  height: 60px;
  transform: rotate(-12deg);
  opacity: 0.18;
}

.three-f-bg-paw-2 {
  left: 320px;
  top: 42px;
  width: 64px;
  height: 64px;
  transform: rotate(10deg);
  opacity: 0.19;
}

.three-f-bg-paw-3 {
  right: 226px;
  top: 91px;
  width: 64px;
  height: 64px;
  opacity: 0.18;
}

.three-f-bg-paw-4 {
  right: 86px;
  top: 110px;
  width: 52px;
  height: 52px;
  opacity: 0.18;
}

.three-f-header {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 16px;
}

.three-f-brand {
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  gap: 17px;
  margin: 0;
  color: var(--three-f-blue);
  font-family: "Iosevka Charon", monospace;
  font-size: clamp(64px, 6.3vw, 102px);
  font-weight: 700;
  line-height: 0.82;
  letter-spacing: -0.065em;
  text-shadow:
    0 5px 0 rgba(5, 57, 156, 0.05),
    0 15px 25px rgba(10, 91, 217, 0.13);
}

.three-f-brand-club {
  position: relative;
  display: inline-flex;
  align-items: flex-end;
}

.three-f-brand-3f,
.three-f-brand-club,
.three-f-brand-c-wrap,
.three-f-brand-letter-c {
  display: inline-block;
}

.three-f-brand-c-wrap {
  position: relative;
}

.three-f-brand-paw {
  position: absolute;
  left: 80%;
  top: 50%;
  z-index: 2;
  display: grid;
  place-items: center;
  width: fit-content;
  height: 0.38em;
  transform: translate(-52%, -49%);
  pointer-events: none;
}

.three-f-brand-paw-img {
  width: fit-content;
  height:fit-content;
  object-fit: contain;
  filter: drop-shadow(0 5px 8px rgba(4, 92, 217, 0.18));
}

.three-f-brand-paw .three-f-fallback-icon {
  color: #0d6fe9;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 5px 8px rgba(4, 92, 217, 0.18));
}

.three-f-subtitle {
  margin: 8px 0 0;
  color: var(--three-f-blue);
  font-size: clamp(24px, 2.25vw, 33px);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.three-f-description {
  margin: 9px auto 0;
  max-width: 650px;
  color: #3d3f49;
  font-size: clamp(15px, 1.35vw, 18px);
  font-weight: 500;
  line-height: 1.33;
}

.three-f-benefit-strip {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  max-width: 1095px;
  min-height: 78px;
  margin: 12px auto 26px;
  overflow: hidden;
  border: 1px solid rgba(202, 220, 240, 0.8);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow:
    0 12px 28px rgba(32, 86, 162, 0.12),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
}

.three-f-benefit-pill {
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
  padding: 14px 26px;
  color: #14295c;
  font-size: 19px;
  font-weight: 750;
  line-height: 1.18;
}

.three-f-benefit-pill:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 18px;
  right: 0;
  width: 1px;
  height: calc(100% - 36px);
  background: rgba(185, 202, 222, 0.78);
}

.three-f-benefit-icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  color: var(--three-f-blue);
}

.three-f-benefit-icon-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.three-f-content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 32px;
  align-items: start;
}

.three-f-left {
  min-width: 0;
}

.three-f-tier-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.three-f-tier-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 382px;
  overflow: hidden;
  padding: 27px 26px 23px;
  border: 2px solid var(--tier-border);
  border-radius: 26px;
  background:
    radial-gradient(circle at 20% 12%, rgba(255, 255, 255, 0.96), transparent 42%),
    linear-gradient(150deg, rgba(255, 255, 255, 0.96), var(--tier-soft));
  box-shadow:
    0 18px 34px rgba(36, 75, 132, 0.13),
    0 0 24px var(--tier-shadow),
    inset 0 0 0 1px rgba(255, 255, 255, 0.76);
}

.three-f-tier-card::before {
  content: "";
  position: absolute;
  right: -72px;
  top: -76px;
  width: 172px;
  height: 172px;
  border-radius: 999px;
  background: radial-gradient(circle, var(--tier) 0%, rgba(255, 255, 255, 0) 68%);
  opacity: 0.17;
}

.three-f-tier-card::after {
  content: "";
  position: absolute;
  left: 19px;
  right: 19px;
  bottom: 14px;
  height: 9px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--tier), transparent);
  opacity: 0.13;
}

.three-f-tier-gold {
  transform: translateY(-1px);
  box-shadow:
    0 18px 35px rgba(36, 75, 132, 0.14),
    0 0 0 4px rgba(255, 199, 61, 0.16),
    0 0 34px rgba(255, 182, 24, 0.24),
    inset 0 0 0 1px rgba(255, 255, 255, 0.86);
}

.three-f-ribbon {
  position: absolute;
  top: -1px;
  left: 50%;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 198px;
  height: 37px;
  justify-content: center;
  padding: 0 22px;
  border-radius: 0 0 17px 17px;
  color: #fff;
  background: linear-gradient(180deg, #ffce55, #f19a0b);
  box-shadow: 0 10px 18px rgba(223, 136, 0, 0.22);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.025em;
  transform: translateX(-50%);
}

.three-f-ribbon::before,
.three-f-ribbon::after {
  content: "";
  position: absolute;
  top: 0;
  width: 18px;
  height: 18px;
  background: #d98903;
}

.three-f-ribbon::before {
  left: -13px;
  clip-path: polygon(100% 0, 0 100%, 100% 100%);
}

.three-f-ribbon::after {
  right: -13px;
  clip-path: polygon(0 0, 0 100%, 100% 100%);
}

.three-f-tier-heading {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  min-height: 104px;
}

.three-f-tier-badge {
  display: grid;
  place-items: center;
  width: 86px;
  height: 96px;
  filter: drop-shadow(0 12px 12px var(--tier-shadow));
}

.three-f-tier-badge-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.three-f-tier-badge .three-f-fallback-icon {
  display: grid;
  place-items: center;
  width: 78px;
  height: 78px;
  border-radius: 22px;
  color: #fff;
  background: linear-gradient(145deg, var(--tier), var(--tier-strong));
}

.three-f-tier-heading h3 {
  margin: 0;
  color: var(--tier-text);
  font-size: clamp(29px, 2.3vw, 39px);
  font-weight: 950;
  line-height: 1;
  letter-spacing: -0.035em;
}

.three-f-tier-heading p {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  margin: 12px 0 0;
  padding: 4px 18px;
  border-radius: 13px;
  color: #293b5b;
  background: var(--tier-chip);
  font-size: 18px;
  font-weight: 780;
  line-height: 1;
}

.three-f-tier-gold .three-f-tier-heading {
  padding-top: 22px;
}

.three-f-card-line {
  height: 1px;
  margin: 15px 6px 15px;
  background: linear-gradient(90deg, transparent, rgba(134, 157, 184, 0.75), transparent);
}

.three-f-tier-benefits {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0 0 0 5px;
  list-style: none;
}

.three-f-tier-benefits li {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  color: #1d2740;
  font-size: 17px;
  font-weight: 650;
  line-height: 1.35;
}

.three-f-check {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(180deg, var(--three-f-blue-2), var(--three-f-blue-dark));
  box-shadow: 0 5px 10px rgba(7, 94, 216, 0.18);
}

.three-f-tier-gold .three-f-check {
  background: linear-gradient(180deg, #f7b724, #de9700);
  box-shadow: 0 5px 10px rgba(217, 149, 0, 0.2);
}

.three-f-tier-action {
  position: relative;
  z-index: 2;
  min-height: 56px;
  margin-top: auto;
  border: 0;
  border-radius: 17px;
  font-family: inherit;
  font-size: 20px;
  font-weight: 850;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
}

.three-f-tier-action:hover {
  transform: translateY(-2px);
  filter: brightness(1.02);
}

.three-f-tier-silver .three-f-tier-action {
  color: var(--three-f-blue-dark);
  background: #fff;
  border: 2px solid var(--three-f-blue);
  box-shadow: inset 0 -6px 10px rgba(7, 94, 216, 0.04);
}

.three-f-tier-gold .three-f-tier-action,
.three-f-tier-platinum .three-f-tier-action {
  color: #fff;
  background: linear-gradient(180deg, #1781f3, #075bd9);
  box-shadow: 0 10px 16px rgba(4, 90, 214, 0.24);
}

.three-f-tier-platinum .three-f-tier-action {
  background: linear-gradient(180deg, #6e72ff, #2d44d9);
}

.three-f-side-card {
  position: relative;
  min-height: 372px;
  padding: 18px 17px;
  border: 1px solid rgba(207, 222, 240, 0.82);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.62);
  box-shadow:
    0 14px 34px rgba(42, 86, 151, 0.12),
    inset 0 0 0 1px rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
}

.three-f-side-benefit {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  min-height: 82px;
  padding: 6px 7px;
  color: #172345;
  font-size: 18px;
  font-weight: 720;
  line-height: 1.32;
}

.three-f-side-benefit:not(:last-child) {
  border-bottom: 1px solid rgba(201, 216, 235, 0.82);
}

.three-f-side-icon {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border: 1px solid rgba(212, 225, 243, 0.95);
  border-radius: 20px;
  color: var(--three-f-blue);
  background:
    radial-gradient(circle at 42% 30%, #fff 0 24px, #f2f8ff 25px),
    linear-gradient(180deg, #ffffff, #edf6ff);
  box-shadow: 0 8px 14px rgba(35, 99, 185, 0.1);
}

.three-f-side-icon-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.three-f-calendar-fallback {
  position: relative;
  display: grid;
  place-items: center;
}

.three-f-calendar-fallback svg:last-child {
  position: absolute;
  right: -6px;
  bottom: -7px;
  padding: 2px;
  border-radius: 999px;
  color: #fff;
  background: var(--three-f-blue);
}

.three-f-cta {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 130px minmax(260px, 1fr) auto;
  gap: 22px;
  align-items: center;
  min-height: 96px;
  margin-top: 22px;
  overflow: hidden;
  padding: 18px 26px 18px 34px;
  border-radius: 27px;
  color: #fff;
  background:
    radial-gradient(circle at 4% 18%, rgba(255, 255, 255, 0.16), transparent 180px),
    linear-gradient(90deg, #075ed8 0%, #096be8 55%, #1677f0 100%);
  box-shadow:
    0 18px 28px rgba(6, 90, 216, 0.22),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.three-f-cta::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.17) 0 1px, transparent 1.5px),
    radial-gradient(circle, rgba(255, 255, 255, 0.16) 0 1px, transparent 1.5px);
  background-size: 42px 42px, 58px 58px;
  background-position: 7px 14px, 29px 3px;
  opacity: 0.45;
  pointer-events: none;
}

.three-f-coupon {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 111px;
  height: 65px;
  color: #fff;
  transform: rotate(-6deg);
}

.three-f-coupon::before {
  content: "";
  position: absolute;
  inset: 5px 2px;
  border: 3px solid rgba(255, 255, 255, 0.98);
  border-radius: 8px;
  clip-path: polygon(0 0, 100% 0, 100% 37%, 91% 50%, 100% 63%, 100% 100%, 0 100%, 0 63%, 9% 50%, 0 37%);
}

.three-f-coupon-img {
  position: relative;
  z-index: 2;
  width: 86px;
  height: 56px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.three-f-coupon .three-f-fallback-icon {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  color: #fff;
}

.three-f-cta p {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: clamp(21px, 2vw, 29px);
  font-weight: 900;
  line-height: 1.28;
  letter-spacing: -0.035em;
}

.three-f-cta-actions {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 13px;
  white-space: nowrap;
}

.three-f-cta-primary,
.three-f-cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 55px;
  border-radius: 18px;
  font-family: inherit;
  font-size: 19px;
  font-weight: 850;
  line-height: 1;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.three-f-cta-primary:hover,
.three-f-cta-secondary:hover {
  transform: translateY(-2px);
}

.three-f-cta-primary {
  gap: 13px;
  padding: 0 18px 0 29px;
  border: 0;
  color: var(--three-f-blue);
  background: #fff;
  box-shadow: 0 10px 18px rgba(5, 69, 172, 0.22);
}

.three-f-button-circle {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(180deg, #0c78ee, #075bd8);
}

.three-f-cta-secondary {
  gap: 8px;
  padding: 0 22px;
  border: 1.5px solid rgba(255, 255, 255, 0.82);
  color: #fff;
  background: rgba(255, 255, 255, 0.07);
}

.three-f-pets {
  position: absolute;
  right: 38px;
  bottom: 11px;
  z-index: 3;
  width: min(315px, 23vw);
  pointer-events: none;
}

.three-f-pets-img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 20px 14px rgba(16, 58, 118, 0.16));
}

.three-f-pets-fallback {
  display: grid;
  place-items: center;
  width: 210px;
  height: 210px;
  margin-left: auto;
  border-radius: 999px;
  color: var(--three-f-blue);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 14px 34px rgba(42, 86, 151, 0.12);
}

.three-f-heart {
  position: absolute;
  color: #75b7f7;
  font-size: 18px;
  opacity: 0.78;
  text-shadow: 0 6px 14px rgba(24, 98, 199, 0.15);
}

.three-f-heart-1 {
  right: -7px;
  top: 49px;
  font-size: 29px;
}

.three-f-heart-2 {
  right: 49px;
  top: 78px;
  font-size: 19px;
}

.three-f-heart-3 {
  right: 66px;
  top: 80px;
  font-size: 17px;
  opacity: 0.55;
}

.three-f-fallback-icon {
  display: inline-grid;
  place-items: center;
}

@media (max-width: 1280px) {
  .three-f-shell {
    padding: 28px 30px 26px;
  }

  .three-f-content {
    grid-template-columns: minmax(0, 1fr) 292px;
    gap: 24px;
  }

  .three-f-tier-grid {
    gap: 18px;
  }

  .three-f-tier-card {
    padding-inline: 20px;
  }

  .three-f-tier-heading {
    grid-template-columns: 78px minmax(0, 1fr);
    gap: 14px;
  }

  .three-f-tier-badge {
    width: 78px;
    height: 88px;
  }

  .three-f-benefit-pill {
    padding-inline: 18px;
    font-size: 17px;
  }

  .three-f-cta {
    grid-template-columns: 108px minmax(230px, 1fr);
  }

  .three-f-cta-actions {
    grid-column: 2 / -1;
    justify-content: flex-start;
  }
}

@media (max-width: 1080px) {
  .three-f-shell {
    min-height: 0;
  }

  .three-f-benefit-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .three-f-benefit-pill:nth-child(2)::after {
    display: none;
  }

  .three-f-content {
    grid-template-columns: 1fr;
  }

  .three-f-side-card {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-height: 0;
  }

  .three-f-side-benefit:nth-child(2) {
    border-bottom: 1px solid rgba(201, 216, 235, 0.82);
  }

  .three-f-side-benefit:nth-child(odd) {
    border-right: 1px solid rgba(201, 216, 235, 0.82);
  }

  .three-f-pets {
    position: relative;
    right: auto;
    bottom: auto;
    width: 280px;
    margin: -18px 6px 0 auto;
  }

  .three-f-shape-right {
    right: 0;
  }
}

@media (max-width: 860px) {
  .three-f-club {
    padding: 12px;
  }

  .three-f-shell {
    padding: 26px 18px 20px;
    border-radius: 26px;
  }

  .three-f-brand {
    gap: 10px;
    letter-spacing: -0.065em;
  }
  .three-f-brand-paw {
    width: 0.36em;
    height: 0.36em;
    transform: translate(-52%, -48%);
  }


  .three-f-description br {
    display: none;
  }

  .three-f-tier-grid {
    grid-template-columns: 1fr;
  }

  .three-f-tier-card {
    min-height: 0;
  }

  .three-f-tier-gold {
    transform: none;
  }

  .three-f-cta {
    grid-template-columns: 86px 1fr;
    gap: 14px;
    padding: 18px;
  }

  .three-f-coupon {
    width: 82px;
  }

  .three-f-cta-actions {
    grid-column: 1 / -1;
    flex-wrap: wrap;
  }

  .three-f-cta-primary,
  .three-f-cta-secondary {
    flex: 1 1 220px;
  }

  .three-f-side-card {
    grid-template-columns: 1fr;
  }

  .three-f-side-benefit,
  .three-f-side-benefit:nth-child(odd),
  .three-f-side-benefit:nth-child(2) {
    border-right: 0;
    border-bottom: 1px solid rgba(201, 216, 235, 0.82);
  }

  .three-f-side-benefit:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 620px) {
  .three-f-benefit-strip {
    grid-template-columns: 1fr;
  }

  .three-f-benefit-pill:not(:last-child)::after {
    top: auto;
    left: 18px;
    right: 18px;
    bottom: 0;
    width: auto;
    height: 1px;
  }

  .three-f-tier-heading {
    grid-template-columns: 78px minmax(0, 1fr);
  }

  .three-f-tier-heading h3 {
    font-size: 31px;
  }

  .three-f-tier-heading p {
    font-size: 16px;
  }

  .three-f-cta {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .three-f-coupon {
    margin: 0 auto;
  }

  .three-f-cta-actions {
    justify-content: center;
  }

  .three-f-pets {
    width: 230px;
    margin: 8px auto 0;
  }

  .three-f-bg-paw-1,
  .three-f-bg-paw-2,
  .three-f-bg-paw-4 {
    display: none;
  }
}
`;

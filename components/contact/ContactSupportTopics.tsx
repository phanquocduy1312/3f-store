import { Bone, Layers, ShoppingCart, RotateCcw, ShieldCheck, Handshake } from "lucide-react";

const TOPICS = [
  {
    title: "Tư vấn thức ăn chó / mèo",
    desc: "Giúp ba mẹ tìm loại hạt phù hợp cho bé nhạy cảm đường ruột hoặc kén ăn.",
    icon: Bone,
  },
  {
    title: "Cát vệ sinh & Phụ kiện",
    desc: "Tư vấn loại cát vón nhanh khử mùi tốt và ổ nằm phù hợp kích cỡ bé.",
    icon: Layers,
  },
  {
    title: "Hỗ trợ tình trạng đơn hàng",
    desc: "Tra cứu lộ trình vận chuyển, ngày giờ nhận hàng dự kiến cho đơn hàng của bạn.",
    icon: ShoppingCart,
  },
  {
    title: "Chính sách đổi trả & Kiểm hàng",
    desc: "Hướng dẫn ba mẹ đổi trả sản phẩm lỗi hoặc đổi vị hạt nếu bé ăn không hợp.",
    icon: RotateCcw,
  },
  {
    title: "Hỗ trợ sau bán & Bảo hành",
    desc: "Lắng nghe ý kiến phản hồi về chất lượng sản phẩm và thái độ phục vụ.",
    icon: ShieldCheck,
  },
  {
    title: "Hợp tác & Cung ứng hàng",
    desc: "Kênh liên lạc dành riêng cho các nhà phân phối và đối tác muốn kết nối.",
    icon: Handshake,
  },
];

export function ContactSupportTopics() {
  return (
    <section className="bg-cream-soft py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-sm font-bold tracking-wider text-forest uppercase">
            🛠️ Lĩnh vực hỗ trợ
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Các vấn đề 3F Store hỗ trợ bạn
          </h2>
          <p className="mt-4 text-base text-ink-soft leading-relaxed">
            Tụi mình luôn ở đây để tháo gỡ mọi băn khoăn của ba mẹ trong suốt hành trình chăm sóc bé cưng.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((topic, idx) => {
            const Icon = topic.icon;
            return (
              <div
                key={idx}
                className="flex gap-4 p-6 rounded-2xl bg-white border border-forest/5 shadow-soft"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-soft text-forest">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink mb-1">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed font-semibold">
                    {topic.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

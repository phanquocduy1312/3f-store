import React, { useState } from "react";
import { Link, Check, Facebook, Twitter, Send, Heart } from "lucide-react";
import { toast } from "sonner";

interface BlogShareProps {
  title: string;
}

export function BlogShare({ title }: BlogShareProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const url = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Đã sao chép đường dẫn bài viết!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Không thể sao chép đường dẫn");
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    toast.success(!liked ? "Đã lưu vào danh sách yêu thích!" : "Đã bỏ yêu thích!");
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  };

  return (
    <div className="px-5">
      <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase border-b border-slate-50 pb-2.5">
        Chia sẻ
      </h4>
      <div className="flex gap-2.5 mt-3">
        <button
          onClick={handleCopy}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-100 transition-all duration-200"
          title="Sao chép liên kết"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Link size={14} />}
        </button>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 transition-all duration-200"
          title="Chia sẻ Facebook"
        >
          <Facebook size={14} />
        </a>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 hover:bg-sky-100 text-sky-500 border border-sky-100 transition-all duration-200"
          title="Chia sẻ Twitter"
        >
          <Twitter size={14} />
        </a>
        <a
          href={shareLinks.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-500 border border-cyan-100 transition-all duration-200"
          title="Chia sẻ Telegram"
        >
          <Send size={13} className="rotate-45 -translate-y-0.5" />
        </a>
        <button
          onClick={handleLike}
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
            liked 
              ? "bg-red-50 border-red-200 text-red-500 scale-105" 
              : "bg-slate-50 border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100"
          }`}
          title="Yêu thích bài viết"
        >
          <Heart size={14} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

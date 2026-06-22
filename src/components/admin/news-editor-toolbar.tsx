import React from "react";
import { Editor } from "@tiptap/react";
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3, Heading4,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link2, Unlink, Image as ImageIcon, Quote, Minus, Undo2, Redo2, 
  Highlighter, Trash2
} from "lucide-react";

interface NewsEditorToolbarProps {
  editor: Editor;
  onImageUpload?: (file: File) => Promise<string>;
}

export function NewsEditorToolbar({ editor, onImageUpload }: NewsEditorToolbarProps) {
  const handleAddLink = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Nhập địa chỉ URL liên kết (bắt đầu bằng http://, https:// hoặc /):", previousUrl);
    if (url === null) return;
    
    const cleanUrl = url.trim();
    if (cleanUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    if (cleanUrl.toLowerCase().startsWith("javascript:")) {
      alert("Địa chỉ liên kết không hợp lệ (giao thức javascript bị chặn).");
      return;
    }

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://") && !cleanUrl.startsWith("/")) {
      alert("URL phải bắt đầu bằng http://, https:// hoặc /");
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: cleanUrl }).run();
  };

  const handleAddImage = () => {
    if (!onImageUpload) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const url = await onImageUpload(file);
          const altText = window.prompt("Nhập mô tả cho ảnh đại diện (Alt text):") || "";
          editor.chain().focus().setImage({ src: url, alt: altText }).run();
        } catch (err: any) {
          alert("Lỗi tải ảnh lên: " + err.message);
        }
      }
    };
    input.click();
  };

  const handleAddImageByUrl = () => {
    const url = window.prompt("Nhập URL hình ảnh (bắt đầu bằng http://, https:// hoặc /):");
    if (url === null) return;
    
    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://") && !cleanUrl.startsWith("/")) {
      alert("URL hình ảnh phải bắt đầu bằng http://, https:// hoặc /");
      return;
    }
    
    const altText = window.prompt("Nhập mô tả cho ảnh (Alt text):") || "";
    editor.chain().focus().setImage({ src: cleanUrl, alt: altText }).run();
  };

  const btn = (active: boolean, cmd: () => void, title: string, icon: React.ReactNode, disabledOption = false) => (
    <button
      type="button"
      disabled={disabledOption || !editor}
      onMouseDown={(e) => e.preventDefault()}
      onClick={cmd}
      className={`p-2 rounded hover:bg-slate-100 transition flex items-center justify-center shrink-0 ${
        active ? "bg-slate-200 text-slate-800 font-bold" : "text-slate-500 hover:text-slate-700"
      } disabled:opacity-30`}
      title={title}
    >
      {icon}
    </button>
  );

  const tableBtn = (cmd: () => void, label: string, isDanger = false) => (
    <button
      type="button"
      disabled={!editor}
      onMouseDown={(e) => e.preventDefault()}
      onClick={cmd}
      className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded transition ${
        isDanger ? "text-rose-600 hover:bg-rose-50" : "text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 bg-slate-50/60 border-b border-slate-200 px-3 py-2 sticky top-0 z-20 backdrop-blur-sm">
      {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), "In đậm (Ctrl+B)", <Bold size={14} />)}
      {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), "In nghiêng (Ctrl+I)", <Italic size={14} />)}
      {btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), "Gạch chân (Ctrl+U)", <UnderlineIcon size={14} />)}
      {btn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), "Gạch ngang", <Strikethrough size={14} />)}
      {btn(editor.isActive("highlight"), () => editor.chain().focus().toggleHighlight().run(), "Highlight đánh dấu", <Highlighter size={14} />)}
      
      <div className="h-5 w-[1px] bg-slate-200 mx-1" />

      {btn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), "Tiêu đề H1", <Heading1 size={14} />)}
      {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "Tiêu đề H2", <Heading2 size={14} />)}
      {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "Tiêu đề H3", <Heading3 size={14} />)}
      {btn(editor.isActive("heading", { level: 4 }), () => editor.chain().focus().toggleHeading({ level: 4 }).run(), "Tiêu đề H4", <Heading4 size={14} />)}

      <div className="h-5 w-[1px] bg-slate-200 mx-1" />

      {btn(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), "Căn trái", <AlignLeft size={14} />)}
      {btn(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), "Căn giữa", <AlignCenter size={14} />)}
      {btn(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), "Căn phải", <AlignRight size={14} />)}
      {btn(editor.isActive({ textAlign: "justify" }), () => editor.chain().focus().setTextAlign("justify").run(), "Căn đều", <AlignJustify size={14} />)}

      <div className="h-5 w-[1px] bg-slate-200 mx-1" />

      {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), "Danh sách không số", <List size={14} />)}
      {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "Danh sách có số", <ListOrdered size={14} />)}

      <div className="h-5 w-[1px] bg-slate-200 mx-1" />

      {btn(editor.isActive("link"), handleAddLink, "Chèn liên kết", <Link2 size={14} />)}
      {btn(editor.isActive("link"), () => editor.chain().focus().unsetLink().run(), "Gỡ bỏ liên kết (Unlink)", <Unlink size={14} />, !editor.isActive("link"))}
      {onImageUpload && btn(false, handleAddImage, "Chèn ảnh từ máy tính", <ImageIcon size={14} />)}
      <button
        type="button"
        disabled={!editor}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleAddImageByUrl}
        className="p-2 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-[10px] font-black border border-slate-300 px-1 py-0.5 shrink-0"
        title="Chèn ảnh từ URL"
      >
        URL
      </button>
      {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), "Khối trích dẫn", <Quote size={14} />)}
      {btn(false, () => editor.chain().focus().setHorizontalRule().run(), "Đường phân cách ngang", <Minus size={14} />)}

      <div className="h-5 w-[1px] bg-slate-200 mx-1 flex-1 min-w-[4px]" />

      {btn(false, () => editor.chain().focus().undo().run(), "Hoàn tác (Undo)", <Undo2 size={14} />, !editor.can().undo())}
      {btn(false, () => editor.chain().focus().redo().run(), "Làm lại (Redo)", <Redo2 size={14} />, !editor.can().redo())}
    </div>
  );
}

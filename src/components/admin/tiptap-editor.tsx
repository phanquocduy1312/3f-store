import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3, List, ListOrdered, Link2, Image as ImageIcon } from "lucide-react";

interface TiptapEditorProps {
  value: string;
  onChange: (val: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export function TiptapEditor({ value = "", onChange, onImageUpload }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const handleAddLink = () => {
    const url = window.prompt("Nhập địa chỉ URL liên kết:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
  };

  const handleAddImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onImageUpload) {
        try {
          const url = await onImageUpload(file);
          editor.chain().focus().setImage({ src: url }).run();
        } catch (err: any) {
          alert("Lỗi tải ảnh: " + err.message);
        }
      } else if (file) {
        // Fallback local base64 preview
        const reader = new FileReader();
        reader.onload = () => {
          editor.chain().focus().setImage({ src: reader.result as string }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const toolbarBtnClass = (active: boolean) =>
    `p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition ${
      active ? "bg-slate-100 text-[#0057E7] font-bold" : ""
    }`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition duration-150">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-50 border-b border-slate-200 px-3 py-2">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={toolbarBtnClass(editor.isActive("bold"))} title="In đậm">
          <Bold size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={toolbarBtnClass(editor.isActive("italic"))} title="In nghiêng">
          <Italic size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={toolbarBtnClass(editor.isActive("underline"))} title="Gạch chân">
          <UnderlineIcon size={15} />
        </button>
        <div className="h-5 w-[1px] bg-slate-200 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarBtnClass(editor.isActive("heading", { level: 2 }))} title="Tiêu đề H2">
          <Heading2 size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={toolbarBtnClass(editor.isActive("heading", { level: 3 }))} title="Tiêu đề H3">
          <Heading3 size={15} />
        </button>
        <div className="h-5 w-[1px] bg-slate-200 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={toolbarBtnClass(editor.isActive("bulletList"))} title="Danh sách">
          <List size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toolbarBtnClass(editor.isActive("orderedList"))} title="Danh sách số">
          <ListOrdered size={15} />
        </button>
        <div className="h-5 w-[1px] bg-slate-200 mx-1" />
        <button type="button" onClick={handleAddLink} className={toolbarBtnClass(editor.isActive("link"))} title="Chèn liên kết">
          <Link2 size={15} />
        </button>
        <button type="button" onClick={handleAddImage} className={toolbarBtnClass(false)} title="Chèn ảnh">
          <ImageIcon size={15} />
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="prose prose-sm max-w-none p-4 min-h-[300px] max-h-[500px] overflow-y-auto outline-none focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import ImageExtension from "@tiptap/extension-image";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
  error?: boolean;
}

interface ToolbarButtonProps {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function looksLikeHtml(value: string) {
  return /<[a-z][\s\S]*>/i.test(value);
}

function normalizeEditorContent(value: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (looksLikeHtml(raw)) return raw;

  return raw
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block.trim()).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function ToolbarButton({ title, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-slate-600 transition ${
        active
          ? "border-[#0057E7] bg-[#EAF3FF] text-[#0057E7] shadow-sm"
          : "border-transparent bg-white hover:border-[#DCEBFF] hover:bg-[#F5F9FF] hover:text-[#0057E7]"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 hidden h-6 w-px shrink-0 bg-[#DCEBFF] sm:block" />;
}

function getHeadingValue(editor: Editor) {
  if (editor.isActive("heading", { level: 2 })) return "h2";
  if (editor.isActive("heading", { level: 3 })) return "h3";
  return "paragraph";
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập mô tả chi tiết sản phẩm...",
  minHeight = 240,
  disabled = false,
  error = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      ImageExtension.configure({
        allowBase64: false,
        inline: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: normalizeEditorContent(value),
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? "" : editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;

    const nextContent = normalizeEditorContent(value);
    const currentContent = editor.isEmpty ? "" : editor.getHTML();
    if (nextContent !== currentContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập URL liên kết", previousUrl || "https://");
    if (url === null) return;

    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    if (!/^https?:\/\//i.test(trimmed)) {
      window.alert("Liên kết cần bắt đầu bằng http:// hoặc https://");
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  };

  const insertImage = () => {
    if (!editor) return;
    const url = window.prompt("Nhập URL hình ảnh", "https://");
    if (url === null) return;

    const trimmed = url.trim();
    if (!trimmed) return;

    if (!/^https?:\/\//i.test(trimmed)) {
      window.alert("URL hình ảnh cần bắt đầu bằng http:// hoặc https://");
      return;
    }

    editor.chain().focus().setImage({ src: trimmed }).run();
  };

  const changeBlock = (nextValue: string) => {
    if (!editor) return;
    if (nextValue === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      return;
    }
    if (nextValue === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      return;
    }
    editor.chain().focus().setParagraph().run();
  };

  const isDisabled = disabled || !editor;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
        error ? "border-red-300 ring-2 ring-red-100" : "border-[#DCEBFF] focus-within:border-[#0057E7] focus-within:ring-2 focus-within:ring-[#DCEBFF]"
      }`}
      style={{ "--rte-min-height": `${minHeight}px` } as CSSProperties}
    >
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-[#DCEBFF] bg-[#F8FBFF]/95 px-3 py-2 backdrop-blur">
        <select
          title="Kiểu đoạn"
          aria-label="Kiểu đoạn"
          disabled={isDisabled}
          value={editor ? getHeadingValue(editor) : "paragraph"}
          onChange={(event) => changeBlock(event.target.value)}
          className="h-9 rounded-lg border border-[#DCEBFF] bg-white px-2 text-xs font-bold text-[#0B1F3A] outline-none transition focus:border-[#0057E7] disabled:opacity-40"
        >
          <option value="paragraph">Đoạn văn</option>
          <option value="h2">Tiêu đề 2</option>
          <option value="h3">Tiêu đề 3</option>
        </select>

        <ToolbarDivider />

        <ToolbarButton title="In đậm" active={editor?.isActive("bold")} disabled={isDisabled} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton title="In nghiêng" active={editor?.isActive("italic")} disabled={isDisabled} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton title="Gạch chân" active={editor?.isActive("underline")} disabled={isDisabled} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Gạch ngang" active={editor?.isActive("strike")} disabled={isDisabled} onClick={() => editor?.chain().focus().toggleStrike().run()}>
          <Strikethrough size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Danh sách chấm" active={editor?.isActive("bulletList")} disabled={isDisabled} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton title="Danh sách số" active={editor?.isActive("orderedList")} disabled={isDisabled} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton title="Trích dẫn" active={editor?.isActive("blockquote")} disabled={isDisabled} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          <Quote size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Căn trái" active={editor?.isActive({ textAlign: "left" })} disabled={isDisabled} onClick={() => editor?.chain().focus().setTextAlign("left").run()}>
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton title="Căn giữa" active={editor?.isActive({ textAlign: "center" })} disabled={isDisabled} onClick={() => editor?.chain().focus().setTextAlign("center").run()}>
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton title="Căn phải" active={editor?.isActive({ textAlign: "right" })} disabled={isDisabled} onClick={() => editor?.chain().focus().setTextAlign("right").run()}>
          <AlignRight size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Thêm liên kết" active={editor?.isActive("link")} disabled={isDisabled} onClick={setLink}>
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Gỡ liên kết" disabled={isDisabled || !editor?.isActive("link")} onClick={() => editor?.chain().focus().extendMarkRange("link").unsetLink().run()}>
          <Unlink size={16} />
        </ToolbarButton>
        <ToolbarButton title="Thêm hình bằng URL" disabled={isDisabled} onClick={insertImage}>
          <ImagePlus size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Hoàn tác" disabled={isDisabled} onClick={() => editor?.chain().focus().undo().run()}>
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton title="Làm lại" disabled={isDisabled} onClick={() => editor?.chain().focus().redo().run()}>
          <Redo2 size={16} />
        </ToolbarButton>
        <ToolbarButton title="Xóa định dạng" disabled={isDisabled} onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Eraser size={16} />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className="rich-text-editor-content max-w-none px-4 py-3 text-sm leading-relaxed text-[#0B1F3A] [&_.ProseMirror]:min-h-[var(--rte-min-height)] [&_.ProseMirror]:outline-none [&_.ProseMirror_a]:font-bold [&_.ProseMirror_a]:text-[#0057E7] [&_.ProseMirror_blockquote]:my-4 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-[#0057E7] [&_.ProseMirror_blockquote]:bg-[#F5F9FF] [&_.ProseMirror_blockquote]:px-4 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-black [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-extrabold [&_.ProseMirror_img]:my-4 [&_.ProseMirror_img]:max-h-[360px] [&_.ProseMirror_img]:rounded-xl [&_.ProseMirror_img]:border [&_.ProseMirror_img]:border-[#DCEBFF] [&_.ProseMirror_li]:my-1 [&_.ProseMirror_ol]:my-3 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_ul]:my-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6"
      />
    </div>
  );
}

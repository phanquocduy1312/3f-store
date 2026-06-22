import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";
import DOMPurify from "dompurify";
import { Eye, Edit3, Maximize2, Minimize2 } from "lucide-react";
import { NewsEditorToolbar } from "./news-editor-toolbar";

interface TiptapEditorProps {
  value: string;
  onChange: (val: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

export function TiptapEditor({ value = "", onChange, onImageUpload }: TiptapEditorProps) {
  const [activeMode, setActiveMode] = useState<"edit" | "preview">("edit");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Link.configure({ 
        openOnClick: false,
        autolink: true,
        linkOnPaste: true
      }),
      Image.configure({ inline: true, HTMLAttributes: { class: "blog-content-image" } }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: "Viết nội dung bài viết thú cưng ở đây...",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      if (import.meta.env.DEV) {
        console.log("TipTap HTML Output:", html);
      }
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const characterCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const cleanPreview = DOMPurify.sanitize(value, {
    ADD_TAGS: ["input"],
    ADD_ATTR: ["data-type", "data-checked", "type", "checked", "disabled"]
  });

  return (
    <div className={`flex flex-col border border-slate-200 bg-white transition-all duration-200 ${
      isFullscreen ? "fixed inset-0 z-50 h-screen w-screen p-4 bg-slate-900/10 backdrop-blur-md" : "rounded-xl overflow-hidden"
    }`}>
      
      <div className="flex flex-col bg-white border border-slate-200 rounded-xl h-full shadow-sm overflow-hidden">
        {/* Toggle Mode & Fullscreen */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-4 py-2 shrink-0">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveMode("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeMode === "edit" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Edit3 size={13} /> Soạn thảo
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeMode === "preview" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Eye size={13} /> Xem trước
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>

        {activeMode === "edit" ? (
          <>
            <NewsEditorToolbar editor={editor} onImageUpload={onImageUpload} />
            <div className={`prose prose-sm max-w-none p-6 min-h-[420px] max-h-[600px] overflow-y-auto outline-none focus:outline-none bg-white blog-tiptap-content ${
              isFullscreen ? "flex-1 max-h-[calc(100vh-160px)]" : ""
            }`}>
              <EditorContent editor={editor} />
            </div>
          </>
        ) : (
          <div className={`prose prose-sm max-w-none p-8 min-h-[420px] max-h-[600px] overflow-y-auto bg-slate-50 blog-tiptap-preview ${
            isFullscreen ? "flex-1 max-h-[calc(100vh-160px)]" : ""
          }`}>
            {value.trim() ? (
              <div 
                className="article-rich-content text-slate-800 leading-relaxed font-medium space-y-6"
                dangerouslySetInnerHTML={{ __html: cleanPreview }} 
              />
            ) : (
              <div className="text-slate-400 font-semibold italic text-center py-12">
                Nội dung bài viết trống. Vui lòng nhập nội dung ở tab Soạn thảo.
              </div>
            )}
          </div>
        )}

        {/* Word/Character Stats Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-200 px-4 py-2.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 select-none">
          <div className="flex gap-4">
            <span>Số từ: <strong className="text-slate-600">{wordCount}</strong></span>
            <span>Số ký tự: <strong className="text-slate-600">{characterCount}</strong></span>
          </div>
          <span>Thời gian đọc ước tính: <strong className="text-slate-600">~{readingTime} phút</strong></span>
        </div>
      </div>

      <style>{`
        .blog-tiptap-content .ProseMirror h1, .blog-tiptap-preview h1 {
          font-size: 1.85rem !important;
          font-weight: 850 !important;
          margin: 1.75rem 0 1rem !important;
          line-height: 1.25 !important;
          color: #0f172a !important;
        }
        .blog-tiptap-content .ProseMirror h2, .blog-tiptap-preview h2 {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          margin: 1.5rem 0 0.75rem !important;
          line-height: 1.3 !important;
          color: #1e293b !important;
        }
        .blog-tiptap-content .ProseMirror h3, .blog-tiptap-preview h3 {
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          margin: 1.25rem 0 0.5rem !important;
          line-height: 1.35 !important;
          color: #1e293b !important;
        }
        .blog-tiptap-content .ProseMirror h4, .blog-tiptap-preview h4 {
          font-size: 1.1rem !important;
          font-weight: 600 !important;
          margin: 1rem 0 0.5rem !important;
          color: #1e293b !important;
        }
        .blog-tiptap-content .ProseMirror p, .blog-tiptap-preview p {
          margin: 0.75rem 0 !important;
          line-height: 1.75 !important;
        }
        .blog-tiptap-content .ProseMirror blockquote, .blog-tiptap-preview blockquote {
          border-left: 4px solid #e5e7eb !important;
          padding-left: 1rem !important;
          color: #475569 !important;
          margin: 1rem 0 !important;
          font-style: italic;
        }
        .blog-tiptap-content .ProseMirror table, .blog-tiptap-preview table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 1rem 0 !important;
        }
        .blog-tiptap-content .ProseMirror th, .blog-tiptap-content .ProseMirror td,
        .blog-tiptap-preview th, .blog-tiptap-preview td {
          border: 1px solid #e5e7eb !important;
          padding: 0.5rem !important;
          min-width: 1em;
        }
        .blog-tiptap-content .ProseMirror ul:not([data-type='taskList']),
        .blog-tiptap-preview ul:not([data-type='taskList']),
        .article-rich-content ul:not([data-type='taskList']) {
          list-style-type: disc !important;
          padding-left: 1.75rem !important;
          margin: 0.75rem 0 !important;
        }
        .blog-tiptap-content .ProseMirror ol,
        .blog-tiptap-preview ol,
        .article-rich-content ol {
          list-style-type: decimal !important;
          padding-left: 1.75rem !important;
          margin: 0.75rem 0 !important;
        }
        .blog-tiptap-content .ProseMirror ul:not([data-type='taskList']) li,
        .blog-tiptap-content .ProseMirror ol li,
        .blog-tiptap-preview ul:not([data-type='taskList']) li,
        .blog-tiptap-preview ol li,
        .article-rich-content ul:not([data-type='taskList']) li,
        .article-rich-content ol li {
          display: list-item !important;
          margin: 0.35rem 0 !important;
          line-height: 1.7 !important;
        }
        .blog-tiptap-content .ProseMirror ul:not([data-type='taskList']) li p,
        .blog-tiptap-content .ProseMirror ol li p,
        .blog-tiptap-preview ul:not([data-type='taskList']) li p,
        .blog-tiptap-preview ol li p,
        .article-rich-content ul:not([data-type='taskList']) li p,
        .article-rich-content ol li p {
          margin: 0 !important;
        }
        .blog-tiptap-content .ProseMirror ul ul, .blog-tiptap-preview ul ul, .article-rich-content ul ul {
          list-style-type: circle !important;
        }
        .blog-tiptap-content .ProseMirror ul ul ul, .blog-tiptap-preview ul ul ul, .article-rich-content ul ul ul {
          list-style-type: square !important;
        }
        .blog-tiptap-content .ProseMirror ol ol, .blog-tiptap-preview ol ol, .article-rich-content ol ol {
          list-style-type: lower-alpha !important;
        }
        .blog-tiptap-content .ProseMirror ul[data-type="taskList"],
        .blog-tiptap-preview ul[data-type="taskList"],
        .article-rich-content ul[data-type="taskList"] {
          list-style: none !important;
          padding-left: 0 !important;
          margin: 0.75rem 0 !important;
        }
        .blog-tiptap-content .ProseMirror ul[data-type='taskList'] > li[data-type='taskItem'],
        .blog-tiptap-preview ul[data-type='taskList'] > li[data-type='taskItem'],
        .article-rich-content ul[data-type='taskList'] > li[data-type='taskItem'] {
          display: grid !important;
          grid-template-columns: 20px 1fr !important;
          column-gap: 8px !important;
          align-items: start !important;
          margin: 0.5rem 0 !important;
          padding: 0 !important;
        }
        .blog-tiptap-content .ProseMirror ul[data-type='taskList'] > li[data-type='taskItem'] > label,
        .blog-tiptap-preview ul[data-type='taskList'] > li[data-type='taskItem'] > label,
        .article-rich-content ul[data-type='taskList'] > li[data-type='taskItem'] > label {
          display: flex !important;
          width: 20px !important;
          min-width: 20px !important;
          max-width: 20px !important;
          margin: 3px 0 0 0 !important;
          padding: 0 !important;
          align-items: center !important;
          justify-content: center !important;
          line-height: 1 !important;
          grid-column: 1 !important;
        }
        .blog-tiptap-content .ProseMirror ul[data-type='taskList'] > li[data-type='taskItem'] > label > input[type='checkbox'],
        .blog-tiptap-preview ul[data-type='taskList'] > li[data-type='taskItem'] > label > input[type='checkbox'],
        .article-rich-content ul[data-type='taskList'] > li[data-type='taskItem'] > label > input[type='checkbox'] {
          width: 16px !important;
          height: 16px !important;
          margin: 0 !important;
          padding: 0 !important;
          cursor: pointer !important;
        }
        .blog-tiptap-content .ProseMirror ul[data-type='taskList'] > li[data-type='taskItem'] > div,
        .blog-tiptap-preview ul[data-type='taskList'] > li[data-type='taskItem'] > div,
        .article-rich-content ul[data-type='taskList'] > li[data-type='taskItem'] > div {
          display: block !important;
          width: auto !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          grid-column: 2 !important;
        }
        .blog-tiptap-content .ProseMirror ul[data-type='taskList'] > li[data-type='taskItem'] > div > p,
        .blog-tiptap-preview ul[data-type='taskList'] > li[data-type='taskItem'] > div > p,
        .article-rich-content ul[data-type='taskList'] > li[data-type='taskItem'] > div > p {
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1.7 !important;
        }
      `}</style>
    </div>
  );
}

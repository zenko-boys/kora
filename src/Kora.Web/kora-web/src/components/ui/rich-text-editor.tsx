"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

interface RichTextEditorProps {
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ onChange, placeholder, className }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: placeholder ?? "Add a description…",
            }),
        ],
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.isEmpty ? "" : editor.getHTML());
        },
    });

    if (!editor) return null;

    function ToolbarBtn({
        active,
        title,
        onClick,
        Icon,
    }: {
        active: boolean;
        title: string;
        onClick: () => void;
        Icon: React.ElementType;
    }) {
        return (
            <button
                type="button"
                title={title}
                onClick={onClick}
                className={[
                    "rounded p-1.5 transition-colors cursor-pointer",
                    active
                        ? "bg-[#8CC63F]/20 text-[#8CC63F]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
            >
                <Icon className="h-3.5 w-3.5" />
            </button>
        );
    }

    return (
        <div
            className={[
                "rounded-md border border-border bg-background focus-within:ring-2 focus-within:ring-[#8CC63F]/50",
                className ?? "",
            ]
                .join(" ")
                .trim()}
        >
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 border-b border-border px-2 py-1">
                <ToolbarBtn
                    active={editor.isActive("bold")}
                    title="Bold"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    Icon={Bold}
                />
                <ToolbarBtn
                    active={editor.isActive("italic")}
                    title="Italic"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    Icon={Italic}
                />
                <ToolbarBtn
                    active={editor.isActive("bulletList")}
                    title="Bullet list"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    Icon={List}
                />
                <ToolbarBtn
                    active={editor.isActive("orderedList")}
                    title="Ordered list"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    Icon={ListOrdered}
                />
            </div>
            {/* Editor area */}
            <EditorContent
                editor={editor}
                className="min-h-20 px-3 py-2 text-sm text-foreground [&_.tiptap]:outline-none"
            />
        </div>
    );
}

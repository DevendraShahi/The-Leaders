'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useCallback, useState, useEffect } from 'react';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    Heading1,
    Heading2
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner';

export interface PendingImage {
    blobUrl: string;
    file: File;
}

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    onPendingImagesChange?: (images: PendingImage[]) => void;
    placeholder?: string;
    className?: string;
}

const MenuBar = ({ editor, onImageUpload }: { editor: any, onImageUpload: () => void }) => {
    if (!editor) {
        return null;
    }

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const MenuButton = ({ onClick, disabled, isActive, title, icon: Icon }: any) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`p-1.5 rounded-none transition-colors ${isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } disabled:opacity-50`}
            title={title}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/20 rounded-none">
            <MenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
                icon={Bold}
            />
            <MenuButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
                icon={Italic}
            />

            <div className="w-px h-6 bg-border mx-1" />

            <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
                icon={Heading1}
            />
            <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
                icon={Heading2}
            />

            <div className="w-px h-6 bg-border mx-1" />

            <MenuButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
                icon={List}
            />
            <MenuButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Ordered List"
                icon={ListOrdered}
            />

            <div className="w-px h-6 bg-border mx-1" />

            <MenuButton
                onClick={addLink}
                isActive={editor.isActive('link')}
                title="Link"
                icon={LinkIcon}
            />
            <MenuButton
                onClick={onImageUpload}
                isActive={false}
                title="Image"
                icon={ImageIcon}
            />
            <MenuButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
                icon={Quote}
            />

            <div className="w-px h-6 bg-border mx-1" />

            <MenuButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                isActive={false}
                title="Undo"
                icon={Undo}
            />
            <MenuButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                isActive={false}
                title="Redo"
                icon={Redo}
            />
        </div>
    );
};

export default function RichTextEditor({ value, onChange, onPendingImagesChange, placeholder, className }: RichTextEditorProps) {
    const { token } = useAuth();
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-none max-w-full h-auto my-4 border border-border',
                },
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-foreground bg-transparent font-serif leading-relaxed',
            },
        },
    });

    // Notify parent component when pending images change
    useEffect(() => {
        if (onPendingImagesChange) {
            onPendingImagesChange(pendingImages);
        }
    }, [pendingImages, onPendingImagesChange]);

    // Sync content when prop changes (needed for editing existing articles)
    useEffect(() => {
        if (editor && value && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    const addImage = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];

                // Create a local blob URL for immediate preview
                const blobUrl = URL.createObjectURL(file);

                // Insert the blob URL into the editor
                editor?.chain().focus().setImage({ src: blobUrl }).run();

                // Store the file for later upload
                setPendingImages(prev => [...prev, { blobUrl, file }]);

                toast.success('Image added (will upload on save)');
            }
        };

        input.click();
    }, [editor]);

    return (
        <div className={`border border-border rounded-none overflow-hidden bg-card ${className}`}>
            <MenuBar editor={editor} onImageUpload={addImage} />
            <EditorContent editor={editor} />
        </div>
    );
}

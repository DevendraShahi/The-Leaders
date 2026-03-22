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
    Heading2,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const MenuBar = ({ editor, onImageUpload, isUploading, uploadError, onRetry }: { 
    editor: any, 
    onImageUpload: () => void,
    isUploading: boolean,
    uploadError: string | null,
    onRetry: () => void
}) => {
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
            disabled={disabled || isUploading}
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
        <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/20 rounded-none items-center">
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
            <div className="relative">
                <MenuButton
                    onClick={onImageUpload}
                    isActive={false}
                    title={uploadError ? "Upload failed - click to retry" : "Image"}
                    icon={isUploading ? Loader2 : (uploadError ? RefreshCw : ImageIcon)}
                />
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                )}
            </div>
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

const validateImage = (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: false, error: 'Only JPG, PNG, WebP, and GIF files are allowed' };
    }
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'File size must be less than 5MB' };
    }
    return { valid: true };
};

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const { token } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

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

    // Sync content when prop changes (needed for editing existing articles)
    useEffect(() => {
        if (editor && value && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    const uploadImage = useCallback(async (file: File): Promise<string | null> => {
        const validation = validateImage(file);
        if (!validation.valid) {
            toast.error(validation.error);
            return null;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'article-content');
        formData.append('folder', 'articles');

        try {
            const res = await fetch('/api/admin/media/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            const data = await res.json();
            return data.data.media.secureUrl;
        } catch (error) {
            console.error('Image upload error:', error);
            return null;
        }
    }, [token]);

    const handleUpload = useCallback(async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ALLOWED_TYPES.join(',');

        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                
                const validation = validateImage(file);
                if (!validation.valid) {
                    setUploadError(validation.error || 'Invalid file');
                    return;
                }

                setIsUploading(true);
                setUploadError(null);
                setPendingFile(file);

                const secureUrl = await uploadImage(file);

                setIsUploading(false);

                if (secureUrl) {
                    editor?.chain().focus().setImage({ src: secureUrl }).run();
                    toast.success('Image uploaded successfully');
                    setPendingFile(null);
                } else {
                    setUploadError('Upload failed. Click to retry.');
                    toast.error('Failed to upload image. Please try again.');
                }
            }
        };

        input.click();
    }, [editor, uploadImage]);

    const handleRetry = useCallback(async () => {
        if (pendingFile) {
            setIsUploading(true);
            setUploadError(null);

            const secureUrl = await uploadImage(pendingFile);

            setIsUploading(false);

            if (secureUrl) {
                editor?.chain().focus().setImage({ src: secureUrl }).run();
                toast.success('Image uploaded successfully');
                setPendingFile(null);
                setUploadError(null);
            } else {
                setUploadError('Upload failed. Click to retry.');
                toast.error('Failed to upload image. Please try again.');
            }
        } else {
            handleUpload();
        }
    }, [editor, pendingFile, uploadImage, handleUpload]);

    return (
        <div className={`border border-border rounded-none overflow-hidden bg-card ${className}`}>
            <MenuBar 
                editor={editor} 
                onImageUpload={handleUpload}
                isUploading={isUploading}
                uploadError={uploadError}
                onRetry={handleRetry}
            />
            <EditorContent editor={editor} />
        </div>
    );
}

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
} from 'lucide-react'

interface BlogEditorProps {
  content?: string
  initialContent?: string
  onChange: (content: string) => void
}

export const BlogEditor = ({ content = '', initialContent = '', onChange }: BlogEditorProps) => {
  const [, forceUpdate] = useState({})

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: initialContent || content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onSelectionUpdate: () => {
      forceUpdate({})
    },
    onTransaction: () => {
      forceUpdate({})
    },
  })

  if (!editor) return null

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex gap-2 p-2 border-b bg-gray-50">
        <Button
          size="sm"
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          type="button"
          variant={
            editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          type="button"
          variant={
            editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          type="button"
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          type="button"
          variant={editor.isActive('blockquote') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="w-4 h-4" />
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-[400px]"
      />
    </div>
  )
}

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'
import { Bold } from 'lucide-react'
import { Node } from '@tiptap/core'

interface TaglineEditorProps {
  content?: string
  initialContent?: string
  onChange: (content: string) => void
}

export const TaglineEditor = ({
  content = '',
  initialContent = '',
  onChange,
}: TaglineEditorProps) => {
  const [, forceUpdate] = useState({})

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [3],
        },
        bold: {},
        hardBreak: {},
        paragraph: {
          HTMLAttributes: {
            class: 'tagline-paragraph',
          },
        },
      }),
    ],
    content: initialContent || content || '<h3>Enter tagline here</h3>',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      let html = editor.getHTML()
      html = html.replace(/<p><\/p>/g, '')
      html = html.replace(/<p>\s*<\/p>/g, '')
      onChange(html)
    },
    onSelectionUpdate: () => {
      forceUpdate({})
    },
    onTransaction: () => {
      forceUpdate({})
    },

    editorProps: {
      attributes: {
        class: 'prose prose-h3:mb-0 prose-p:mb-0 max-w-none outline-none',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          return true
        }
        return false
      },
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
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-h3:mb-0 prose-p:mb-0 max-w-none p-4 min-h-[60px]"
      />
    </div>
  )
}

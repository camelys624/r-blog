'use client'

import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { nord } from '@milkdown/theme-nord'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { useRef } from 'react'
import { EditorToolbar } from './EditorToolbar'

import '@milkdown/theme-nord/style.css'

interface MarkdownEditorProps {
  initialContent?: string
  onChange?: (markdown: string) => void
  placeholder?: string
}

function MilkdownEditor({
  initialContent = '',
  onChange,
}: MarkdownEditorProps) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, initialContent)
        ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
          onChangeRef.current?.(markdown)
        })
      })
      .config(nord)
      .use(commonmark)
      .use(gfm)
      .use(listener)
  , [])

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      <EditorToolbar />
      <div className="milkdown-editor-wrapper min-h-[300px] p-4">
        <Milkdown />
      </div>
    </div>
  )
}

export function MarkdownEditor(props: MarkdownEditorProps) {
  return (
    <MilkdownProvider>
      <MilkdownEditor {...props} />
    </MilkdownProvider>
  )
}

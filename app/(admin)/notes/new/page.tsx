'use client'

import { MarkdownEditor } from '@/components/Editor'
import { useState, useCallback } from 'react'

export default function NewNotePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleContentChange = useCallback((markdown: string) => {
    setContent(markdown)
  }, [])

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Note</h1>
        <p className="mt-2 text-sm text-gray-600">
          Write your note using markdown syntax
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="My awesome note"
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Content
        </label>
        <MarkdownEditor
          initialContent="# Hello World

Start writing here...

## Features

- **Bold** and *italic* text
- ~~Strikethrough~~
- `inline code`
- Lists and tables

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
"
          onChange={handleContentChange}
        />
      </div>

      {/* Markdown Preview */}
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          Raw Markdown Output:
        </h3>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs text-gray-600">
          {content || '(empty)'}
        </pre>
      </div>
    </div>
  )
}

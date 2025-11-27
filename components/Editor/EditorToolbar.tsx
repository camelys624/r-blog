'use client'

import { useInstance } from '@milkdown/react'
import { callCommand } from '@milkdown/utils'
import {
  toggleStrongCommand,
  toggleEmphasisCommand,
  wrapInHeadingCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
  insertHrCommand,
  toggleInlineCodeCommand,
} from '@milkdown/preset-commonmark'
import { insertTableCommand, toggleStrikethroughCommand } from '@milkdown/preset-gfm'

interface ToolbarButton {
  label: string
  icon: string
  command: () => void
  title: string
}

export function EditorToolbar() {
  const [loading, get] = useInstance()

  const execCommand = (command: any, payload?: any) => {
    if (loading) return
    get()?.action(callCommand(command.key, payload))
  }

  const buttons: ToolbarButton[] = [
    {
      label: 'B',
      icon: '𝐁',
      command: () => execCommand(toggleStrongCommand),
      title: 'Bold (Ctrl+B)',
    },
    {
      label: 'I',
      icon: '𝐼',
      command: () => execCommand(toggleEmphasisCommand),
      title: 'Italic (Ctrl+I)',
    },
    {
      label: 'S',
      icon: 'S̶',
      command: () => execCommand(toggleStrikethroughCommand),
      title: 'Strikethrough',
    },
    {
      label: 'Code',
      icon: '</>',
      command: () => execCommand(toggleInlineCodeCommand),
      title: 'Inline Code (Ctrl+`)',
    },
    {
      label: 'H1',
      icon: 'H1',
      command: () => execCommand(wrapInHeadingCommand, 1),
      title: 'Heading 1',
    },
    {
      label: 'H2',
      icon: 'H2',
      command: () => execCommand(wrapInHeadingCommand, 2),
      title: 'Heading 2',
    },
    {
      label: 'H3',
      icon: 'H3',
      command: () => execCommand(wrapInHeadingCommand, 3),
      title: 'Heading 3',
    },
    {
      label: 'UL',
      icon: '•',
      command: () => execCommand(wrapInBulletListCommand),
      title: 'Bullet List',
    },
    {
      label: 'OL',
      icon: '1.',
      command: () => execCommand(wrapInOrderedListCommand),
      title: 'Ordered List',
    },
    {
      label: 'HR',
      icon: '—',
      command: () => execCommand(insertHrCommand),
      title: 'Horizontal Rule',
    },
    {
      label: 'Table',
      icon: '⊞',
      command: () => execCommand(insertTableCommand),
      title: 'Insert Table',
    },
  ]

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2">
      {buttons.map((button, index) => (
        <button
          key={index}
          type="button"
          onClick={button.command}
          disabled={loading}
          title={button.title}
          className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {button.icon}
        </button>
      ))}
    </div>
  )
}

// markdownShortcuts.js - Markdown Input Rules Extension

import { Extension } from '@tiptap/core'
import { textblockTypeInputRule, wrappingInputRule, markInputRule, markPasteRule } from '@tiptap/core'

export const MarkdownShortcuts = Extension.create({
  name: 'markdownShortcuts',

  addInputRules() {
    return [
      // Heading shortcuts: # to ######
      textblockTypeInputRule({
        find: /^#\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 1 }),
      }),
      textblockTypeInputRule({
        find: /^##\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 2 }),
      }),
      textblockTypeInputRule({
        find: /^###\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 3 }),
      }),
      textblockTypeInputRule({
        find: /^####\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 4 }),
      }),
      textblockTypeInputRule({
        find: /^#####\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 5 }),
      }),
      textblockTypeInputRule({
        find: /^######\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 6 }),
      }),

      // Bullet list: - or *
      wrappingInputRule({
        find: /^\s*([-*])\s$/,
        type: this.editor.schema.nodes.bulletList,
      }),

      // Ordered list: 1.
      wrappingInputRule({
        find: /^(\d+)\.\s$/,
        type: this.editor.schema.nodes.orderedList,
      }),

      // Task list: [ ] or [x]
      wrappingInputRule({
        find: /^\s*(\[ \])\s$/,
        type: this.editor.schema.nodes.taskList,
      }),
      wrappingInputRule({
        find: /^\s*(\[x\])\s$/,
        type: this.editor.schema.nodes.taskList,
      }),

      // Blockquote: >
      wrappingInputRule({
        find: /^\s*>\s$/,
        type: this.editor.schema.nodes.blockquote,
      }),

      // Code block: ```
      textblockTypeInputRule({
        find: /^```$/,
        type: this.editor.schema.nodes.codeBlock,
      }),

      // Horizontal rule: ---
      textblockTypeInputRule({
        find: /^---$/,
        type: this.editor.schema.nodes.horizontalRule,
      }),
    ]
  },

  addPasteRules() {
    return [
      // Bold: **text**
      markPasteRule({
        find: /\*\*([^*]+)\*\*/g,
        type: this.editor.schema.marks.bold,
      }),

      // Italic: *text* or _text_
      markPasteRule({
        find: /\*([^*]+)\*/g,
        type: this.editor.schema.marks.italic,
      }),
      markPasteRule({
        find: /_([^_]+)_/g,
        type: this.editor.schema.marks.italic,
      }),

      // Strikethrough: ~~text~~
      markPasteRule({
        find: /~~([^~]+)~~/g,
        type: this.editor.schema.marks.strike,
      }),

      // Inline code: `text`
      markPasteRule({
        find: /`([^`]+)`/g,
        type: this.editor.schema.marks.code,
      }),
    ]
  },
})

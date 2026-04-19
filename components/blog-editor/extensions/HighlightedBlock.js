import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import HighlightedBlockComponent from './HighlightedBlockComponent';

export const HighlightedBlock = Node.create({
  name: 'highlightedBlock',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info', // 'info' or 'warning'
      },
      ...this.parent?.(),
      // Common style attributes
      marginTop: { default: 0 },
      marginRight: { default: 0 },
      marginBottom: { default: 0 },
      marginLeft: { default: 0 },
      paddingTop: { default: 16 },
      paddingRight: { default: 16 },
      paddingBottom: { default: 16 },
      paddingLeft: { default: 16 },
      borderRadiusTopLeft: { default: 8 },
      borderRadiusTopRight: { default: 8 },
      borderRadiusBottomRight: { default: 8 },
      borderRadiusBottomLeft: { default: 8 },
      width: { default: null },
      height: { default: null },
      minWidth: { default: null },
      maxWidth: { default: null },
      minHeight: { default: null },
      maxHeight: { default: null },
      textAlign: { default: 'left' },
      textColor: { default: '#000000' },
      bgColor: { default: '#ffffff' },
      opacity: { default: 1 },
      boxShadow: { default: 'none' },
      borderWidth: { default: 1 },
      borderStyle: { default: 'solid' },
      borderColor: { default: '#e5e7eb' },
      isHidden: { default: false },
      cursor: { default: 'auto' },
      zIndex: { default: 0 },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="highlighted-block"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'highlighted-block' }), 0]
  },

  addCommands() {
    return {
      insertHighlightedBlock: attributes => ({ state, chain, commands }) => {
        const { $from } = state.selection;
        let isInside = false;
        let depth = $from.depth;
        
        while (depth > 0) {
          if ($from.node(depth).type.name === this.name) {
            isInside = true;
            break;
          }
          depth--;
        }

        if (isInside) {
          const pos = $from.after(depth);
          return chain()
            .insertContentAt(pos, {
              type: this.name,
              attrs: attributes,
              content: [{ type: 'paragraph' }],
            })
            .focus(pos + 2)
            .run();
        }

        return commands.insertContent({
          type: this.name,
          attrs: attributes,
          content: [{ type: 'paragraph' }],
        });
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(HighlightedBlockComponent);
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state, view } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) return false;

        let isInside = false;
        let depth = $from.depth;
        
        while (depth > 0) {
          if ($from.node(depth).type.name === this.name) {
            isInside = true;
            break;
          }
          depth--;
        }

        if (!isInside) return false;

        // If at the end of the block, break out
        const node = $from.node(depth);
        const endPos = $from.start(depth) + node.content.size;

        if ($from.pos === endPos) {
          return editor.commands.insertContentAt($from.after(depth), {
            type: 'paragraph',
          });
        }
        
        // Otherwise, allow default enter behavior (creates a new paragraph inside)
        return false;
      },
      'Mod-Enter': ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;
        
        let depth = $from.depth;
        while (depth > 0 && $from.node(depth).type.name !== this.name) {
          depth--;
        }
        
        if (depth > 0) {
          return editor.commands.insertContentAt($from.after(depth), {
            type: 'paragraph',
          });
        }
        return false;
      }
    };
  },
});

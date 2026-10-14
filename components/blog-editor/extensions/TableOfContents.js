import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import TableOfContentsComponent from './TableOfContentsComponent';

export const TableOfContents = Node.create({
  name: 'tableOfContents',

  group: 'block',
  
  atom: true, // Behaves as a single unit, content is managed by React

  addAttributes() {
    return {
      // Add custom attributes if necessary
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="toc"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toc' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TableOfContentsComponent);
  },
});

import { generateHTML } from '@tiptap/html';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Bold from '@tiptap/extension-bold';
import StarterKit from '@tiptap/starter-kit';
import { Node, mergeAttributes } from '@tiptap/core';
import { v4 as uuidv4 } from 'uuid';

const Section = Node.create({
  name: "section",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      id: { default: () => '123' },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'section',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    const mergedAttributes = mergeAttributes(HTMLAttributes, {
      "data-type": "section",
      class: "editor-section",
      "data-id": HTMLAttributes.id,
    });
    return ["div", mergedAttributes, 0];
  },
});

const Container = Node.create({
  name: "container",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [
      {
        tag: 'div[data-type="container"]',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-type": "container" }, 0];
  },
});

const json = {
  "type": "doc",
  "content": [
    {
      "type": "container",
      "content": [
        {
          "type": "section",
          "content": [
            {
              "type": "table",
              "content": [
                {
                  "type": "tableRow",
                  "content": [
                    {
                      "type": "tableHeader",
                      "content": [
                        {
                          "type": "paragraph",
                          "content": [
                            { "type": "text", "marks": [{ "type": "bold" }], "text": "Stack Name" }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const html = generateHTML(json, [
  StarterKit.configure({
    paragraph: false,
    document: false,
    heading: false,
    codeBlock: false,
    bulletList: false,
    orderedList: false,
    listItem: false,
    taskList: false,
    taskItem: false,
  }),
  Document.extend({ content: "block+" }),
  Paragraph,
  Text,
  Bold,
  Section,
  Container,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
]);

console.log("HTML:", html);

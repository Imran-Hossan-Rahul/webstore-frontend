// commandsData.js - Slash Commands Data with Icons and Descriptions

import {
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Table,
  Image,
  Video,
  Mic2,
  CornerDownRight,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Highlighter,
  Globe,
  Zap,
} from "lucide-react";

export const SLASH_COMMANDS = [
  // ==================== TEXT BLOCKS ====================
  {
    title: "Paragraph",
    description: "Normal text paragraph",
    searchTerms: ["p", "paragraph", "text", "normal"],
    icon: FileText,
    category: "text",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("paragraph")
        .run();
    },
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    searchTerms: ["h1", "heading", "title", "big"],
    icon: Heading1,
    category: "text",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    searchTerms: ["h2", "heading", "subtitle"],
    icon: Heading2,
    category: "text",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    searchTerms: ["h3", "heading", "subheading"],
    icon: Heading3,
    category: "text",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Heading 4",
    description: "Smaller heading",
    searchTerms: ["h4", "heading"],
    icon: Heading4,
    category: "text",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 4 })
        .run();
    },
  },
  {
    title: "Heading 5",
    description: "Tiny heading",
    searchTerms: ["h5", "heading"],
    icon: Heading5,
    category: "text",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 5 })
        .run();
    },
  },
  {
    title: "Heading 6",
    description: "Smallest heading",
    searchTerms: ["h6", "heading"],
    icon: Heading6,
    category: "text",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 6 })
        .run();
    },
  },

  // ==================== LISTS ====================
  {
    title: "Bullet List",
    description: "Create a bulleted list",
    searchTerms: ["ul", "bullet", "list", "unordered"],
    icon: List,
    category: "list",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBulletList()
        .run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    searchTerms: ["ol", "ordered", "number", "list"],
    icon: ListOrdered,
    category: "list",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleOrderedList()
        .run();
    },
  },
  {
    title: "Task List",
    description: "Create a checklist",
    searchTerms: ["todo", "task", "check", "checkbox", "list"],
    icon: CheckSquare,
    category: "list",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleTaskList()
        .run();
    },
  },

  // ==================== FORMATTING ====================
  {
    title: "Blockquote",
    description: "Insert a quote block",
    searchTerms: ["quote", "blockquote", "citation"],
    icon: Quote,
    category: "format",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBlockquote()
        .run();
    },
  },
  {
    title: "Code Block",
    description: "Insert a code block",
    searchTerms: ["code", "codeblock", "pre", "programming"],
    icon: Code,
    category: "format",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCodeBlock()
        .run();
    },
  },

  // ==================== LAYOUT ====================
  {
    title: "Divider",
    description: "Insert a horizontal line",
    searchTerms: ["hr", "divider", "line", "separator", "horizontal"],
    icon: Minus,
    category: "layout",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHorizontalRule()
        .run();
    },
  },
  {
    title: "Hard Break",
    description: "Insert a line break",
    searchTerms: ["br", "break", "newline", "line"],
    icon: CornerDownRight,
    category: "layout",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHardBreak()
        .run();
    },
  },

  // ==================== MEDIA ====================
  {
    title: "Table",
    description: "Insert a table",
    searchTerms: ["table", "grid", "spreadsheet"],
    icon: Table,
    category: "media",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    title: "Image",
    description: "Upload or embed an image",
    searchTerms: ["image", "img", "photo", "picture", "media"],
    icon: Image,
    category: "media",
    command: ({ editor, range, setImageModalOpen }) => {
      editor.chain().focus().deleteRange(range).run();
      // Trigger image modal
      if (setImageModalOpen) {
        setImageModalOpen(true);
      }
    },
  },
  {
    title: "Video",
    description: "Embed a video",
    searchTerms: ["video", "youtube", "vimeo", "media"],
    icon: Video,
    category: "media",
    command: ({ editor, range, setVideoModalOpen }) => {
      editor.chain().focus().deleteRange(range).run();
      // Trigger video modal
      if (setVideoModalOpen) {
        setVideoModalOpen(true);
      }
    },
  },
  {
    title: "Audio",
    description: "Upload an audio file",
    searchTerms: ["audio", "sound", "music", "media"],
    icon: Mic2,
    category: "media",
    command: ({ editor, range, setAudioModalOpen }) => {
      editor.chain().focus().deleteRange(range).run();
      // Trigger audio modal
      if (setAudioModalOpen) {
        setAudioModalOpen(true);
      }
    },
  },
  {
    title: "Embed",
    description: "Embed anything (Figma, CodePen, etc)",
    searchTerms: ["embed", "iframe", "figma", "codepen", "twitter"],
    icon: Globe,
    category: "media",
    command: ({ editor, range, setEmbedModalOpen }) => {
      editor.chain().focus().deleteRange(range).run();
      if (setEmbedModalOpen) {
        setEmbedModalOpen(true);
      }
    },
  },
  {
    title: "Ask AI",
    description: "Get AI writing assistance",
    searchTerms: ["ai", "assistant", "help", "write", "generate", "magic"],
    icon: Zap,
    category: "ai",
    command: ({ editor, range, openAISelector }) => {
      editor.chain().focus().deleteRange(range).run();
      if (openAISelector) {
        openAISelector();
      }
    },
  },
];

// Helper function to filter commands based on query
export const getSuggestions = (query) => {
  const lowerQuery = query.toLowerCase();
  
  return SLASH_COMMANDS.filter((command) => {
    // Search in title
    if (command.title.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Search in description
    if (command.description.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Search in search terms
    if (command.searchTerms.some(term => term.includes(lowerQuery))) {
      return true;
    }
    
    return false;
  }).slice(0, 10); // Limit to 10 results
};

// Group commands by category
export const COMMAND_CATEGORIES = {
  text: "Text",
  list: "Lists",
  format: "Formatting",
  layout: "Layout",
  media: "Media",
  ai: "AI Assistant",
};

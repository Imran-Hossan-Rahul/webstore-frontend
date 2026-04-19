import { Node, mergeAttributes } from "@tiptap/core";

export const UniversalEmbed = Node.create({
  name: "universalEmbed",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: "100%",
      },
      height: {
        default: "400px", // Increased default height for better visibility
      },
      title: {
        default: "Embed",
      },
      service: {
        default: "generic",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "universal-embed-wrapper my-4 relative rounded-lg overflow-hidden border border-gray-200 shadow-sm" },
      [
        "iframe",
        mergeAttributes(HTMLAttributes, {
            frameborder: "0",
            allowfullscreen: "true",
            class: "w-full h-full",
            style: `height: ${HTMLAttributes.height || '400px'}; min-height: 300px;`
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setUniversalEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

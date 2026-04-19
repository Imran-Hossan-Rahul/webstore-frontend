// slashCommands.js - TipTap Slash Commands Extension

import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import SlashCommandsList from "./SlashCommandsList";
import { getSuggestions } from "./commandsData";

export const SlashCommands = Extension.create({
  name: "slashCommands",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        command: ({ editor, range, props }) => {
          // props now contains the item merged with modal handlers
          // Extract the command function and call it with all necessary props
          const { command, ...itemProps } = props;
          if (command) {
            command({ editor, range, ...itemProps });
          }
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const createSuggestionOptions = (additionalProps = {}) => ({
  items: ({ query }) => {
    return getSuggestions(query);
  },

  render: () => {
    let component;
    let popup;

    return {
      onStart: (props) => {
        component = new ReactRenderer(SlashCommandsList, {
          props: {
            ...props,
            ...additionalProps,
          },
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
          theme: "slash-commands",
          maxWidth: "none",
          offset: [0, 8],
          animation: "shift-away",
          duration: [200, 150],
        });
      },

      onUpdate(props) {
        component.updateProps({
          ...props,
          ...additionalProps,
        });

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0].hide();
          return true;
        }

        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
});

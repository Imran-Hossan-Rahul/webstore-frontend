// SlashCommandsList.jsx - Command Palette UI Component

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { getSuggestions } from "./commandsData";

const SlashCommandsList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { items, command, setImageModalOpen, setVideoModalOpen, setAudioModalOpen, ...otherProps } = props;

  const selectItem = (index) => {
    const item = items[index];
    if (item) {
      // Pass the item along with modal handlers
      command({ 
        ...item, 
        setImageModalOpen, 
        setVideoModalOpen, 
        setAudioModalOpen 
      });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  if (!items || items.length === 0) {
    return (
      <div className="slash-commands-list">
        <div className="slash-commands-empty">
          <p className="text-sm text-gray-500">No commands found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="slash-commands-list">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            className={`slash-command-item ${
              index === selectedIndex ? "selected" : ""
            }`}
            key={index}
            onClick={() => selectItem(index)}
            type="button"
          >
            <div className="slash-command-icon">
              {Icon && <Icon className="w-4 h-4" />}
            </div>
            <div className="slash-command-content">
              <div className="slash-command-title">{item.title}</div>
              <div className="slash-command-description">
                {item.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
});

SlashCommandsList.displayName = "SlashCommandsList";

export default SlashCommandsList;

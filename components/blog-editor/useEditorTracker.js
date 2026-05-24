// components/codex-editor/useEditorTracker.js
import { useEffect, useRef } from "react";

export default function useEditorTracker(editor, onEvent) {
  const timeoutRef = useRef();

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        const detected = [];

        // Safe traversal using ProseMirror API
        editor.state.doc.descendants((node) => {
          if (node.attrs?.__id) {
            detected.push({
              id: node.attrs.__id,
              type: node.type.name,
            });
          }
        });

        onEvent(detected);
      }, 50); // 50ms debounce
    };

    const unsubscribe = editor.on("update", handleUpdate);

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [editor, onEvent]);
}


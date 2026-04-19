import { useState, useEffect, useCallback } from "react";

/**
 * Tiptap এডিটর থেকে বর্তমানে নির্বাচিত বা ফোকাস করা ব্লক-লেভেল নোডটিকে ট্র্যাক করার জন্য কাস্টম হুক।
 * এটি RightPanel-এ লাইভ প্রপার্টি সিঙ্ক করতে সাহায্য করে।
 * @param {object} editor Tiptap Editor Instance
 * @returns {{node: object|null, pos: number|null}} বর্তমানে নির্বাচিত নোড এবং তার অবস্থান
 */
export const useCurrentNode = (editor) => {
  const [currentNode, setCurrentNode] = useState({ node: null, pos: null }); // ⭐ লজিক ৫ (স্থিতিশীলতা): এই ফাংশনটি useCallback ব্যবহার করে রেন্ডারের সাথে সাথে নতুন করে তৈরি হওয়া থেকে আটকানো হয়েছে।

  const updateCurrentNode = useCallback((editorState) => {
    // ⭐ লজিক ২ (নিরাপত্তা): এডিটর স্টেট অবৈধ বা ডিসপোজাল অবস্থায় থাকলে হ্যান্ডেল করা।
    if (!editorState || !editorState.doc) {
      setCurrentNode({ node: null, pos: null });
      return;
    }
    const { selection } = editorState;
    const { $from, $to } = selection;

    let selectedNode = null;
    let nodePos = null; // ১. নোড সিলেকশন (যেমন Image, Figure, Media)

    if (selection.node) {
      selectedNode = selection.node;
      nodePos = $from.pos;
    } // ২. ব্লক সিলেকশন (যেমন Paragraph, Heading, List, Section)
    else if ($from.depth > 0) {
      // কার্সরের পজিশন থেকে উপরে প্যারেন্ট ব্লক নোড খুঁজে বের করার লুপ
      for (let d = $from.depth; d > 0; d--) {
        const node = $from.node(d);
        const pos = $from.before(d);
        const nodeName = node.type.name; // টার্গেট ব্লক-লেভেল নোডগুলো (ডিজাইন প্যানেলে নিয়ন্ত্রণের প্রয়োজন)

        if (
          [
            "paragraph",
            "heading",
            "image",
            "section",
            "bulletList",
            "orderedList",
            "taskList",
            "listItem", // ⭐ লজিক ৩ (লিস্ট): লিস্ট আইটেমকে সরাসরি টার্গেট করার জন্য যোগ করা হয়েছে।
            "codeBlockLowlight",
          ].includes(nodeName)
        ) {
          // ⭐ লজিক ১ (সুরক্ষা): শুধুমাত্র ব্লক নোডই সিলেক্ট করা নিশ্চিত করা।
          // যদি এটি টেকনিক্যালি একটি ব্লক নোড হয় তবেই এটি ডিজাইন পরিবর্তন করতে সক্ষম।
          if (node.isBlock) {
            selectedNode = node;
            nodePos = pos;
            break;
          }
        }
      }
    }

    setCurrentNode({ node: selectedNode, pos: nodePos });
  }, []); // ডিপেন্ডেন্সি অ্যারে খালি, কারণ এটি বাইরে থেকে শুধু editorState গ্রহণ করে

  useEffect(() => {
    if (!editor) return; // ইনিশিয়াল নোড সেট

    updateCurrentNode(editor.state); // ইভেন্ট হ্যান্ডলার তৈরি করা (useCallback ব্যবহারের সুবিধা নিতে)

    const handleUpdate = () => {
      updateCurrentNode(editor.state);
    };
    const handleSelectionUpdate = () => {
      updateCurrentNode(editor.state);
    }; // Tiptap ইভেন্ট লিসেন করা

    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      // ক্লিনার: মেমরি লিক প্রতিরোধ করা
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, updateCurrentNode]); // updateCurrentNode এখানে আবশ্যক

  return currentNode;
};

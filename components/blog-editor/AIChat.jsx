
import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Copy, ArrowRight, Undo2, Redo2 } from "lucide-react";

/**
 * AI Chat Interface Component
 * A floating, draggable chat window for interacting with the AI.
 */
const AIChat = ({ editor, isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hi! I'm your AI assistant. How can I help you write today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition(prev => ({
          x: prev.x + e.movementX,
          y: prev.y + e.movementY
        }));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get Editor Context
      const context = editor ? editor.getText() : "";
      
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage], // Send full history
          editorContext: context,
          model: selectedModel // Send selected model
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      // Handle stream with function call support
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let aiResponseText = "";
      
      // Add placeholder message
      setMessages(prev => [...prev, { role: 'model', content: "", isStreaming: true }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const data = JSON.parse(line);
            
            if (data.type === 'text') {
              // Accumulate text response
              aiResponseText += data.content;
              
              // Update the last message with text
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                lastMsg.content = aiResponseText;
                return newMessages;
              });
              
            } else if (data.type === 'function_call') {
              // Execute function call on editor
              const { name, args } = data;
              try {
                executeFunctionCall(name, args);
                
                // Add action confirmation to chat
                const actionMessage = getActionMessage(name, args);
                aiResponseText += `\n\n✓ ${actionMessage}`;
                
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  lastMsg.content = aiResponseText;
                  // Store the raw text that was inserted/replaced for the UI buttons
                  lastMsg.actionText = args.newText || args.text || "";
                  return newMessages;
                });
              } catch (err) {
                console.error(`Failed to execute ${name}:`, err);
                aiResponseText += `\n\n✗ Failed to execute action`;
                
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  lastMsg.content = aiResponseText;
                  return newMessages;
                });
              }
            }
          } catch (parseErr) {
            console.warn('Failed to parse line:', line);
          }
        }
      }

      // Finalize
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].isStreaming = false;
        return newMessages;
      });

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute function calls on the editor
  const executeFunctionCall = (name, args) => {
    if (!editor) return;

    switch (name) {
      case 'insertText':
        if (editor.state.selection.empty) {
          editor.chain().focus().insertContent(args.text).run();
        } else {
          editor.chain().focus().deleteSelection().insertContent(args.text).run();
        }
        break;
        
      case 'replaceText':
        // Replaces the current selection or the whole document if empty
        if (!editor.state.selection.empty) {
          editor.chain().focus().deleteSelection().insertContent(args.newText || args.text).run();
        } else {
          editor.chain().focus().selectAll().deleteSelection().insertContent(args.newText || args.text).run();
        }
        break;
        
      case 'addParagraph':
        editor.chain().focus().insertContent({
          type: 'paragraph',
          content: [{ type: 'text', text: args.text }]
        }).run();
        break;
        
      case 'addHeading':
        editor.chain().focus().insertContent({
          type: 'heading',
          attrs: { level: args.level },
          content: [{ type: 'text', text: args.text }]
        }).run();
        break;
        
      case 'addFormattedText':
        // Insert text with formatting marks
        const marks = [];
        if (args.format && args.format !== 'normal') {
          marks.push({ type: args.format });
        }
        
        editor.chain().focus().insertContent({
          type: 'text',
          text: args.text,
          marks: marks
        }).run();
        break;
        
      case 'insertList':
        if (args.type === 'bullet') {
          editor.chain().focus().toggleBulletList().run();
          if (args.items && args.items.length > 0) {
            args.items.forEach((item, index) => {
              if (index > 0) editor.chain().focus().splitListItem('listItem').run();
              editor.chain().focus().insertContent(item).run();
            });
          }
        } else if (args.type === 'numbered') {
          editor.chain().focus().toggleOrderedList().run();
          if (args.items && args.items.length > 0) {
            args.items.forEach((item, index) => {
              if (index > 0) editor.chain().focus().splitListItem('listItem').run();
              editor.chain().focus().insertContent(item).run();
            });
          }
        } else if (args.type === 'task') {
          editor.chain().focus().toggleTaskList().run();
        }
        break;
        
      case 'clearContent':
        editor.chain().focus().clearContent().run();
        break;
        
      default:
        console.warn(`Unknown function: ${name}`);
    }
  };

  // Get user-friendly action message
  const getActionMessage = (name, args) => {
    switch (name) {
      case 'insertText':
        return `Inserted: "${args.text.substring(0, 40)}${args.text.length > 40 ? '...' : ''}"`;
      case 'replaceText':
        const newTxt = args.newText || args.text || '';
        return `Replaced text with: "${newTxt.substring(0, 40)}${newTxt.length > 40 ? '...' : ''}"`;
      case 'addParagraph':
        return `Added paragraph`;
      case 'addHeading':
        return `Added heading (H${args.level})`;
      case 'addFormattedText':
        return `Added ${args.format} text: "${args.text.substring(0, 30)}${args.text.length > 30 ? '...' : ''}"`;
      case 'insertList':
        return `Inserted ${args.type} list`;
      case 'clearContent':
        return `Cleared editor content`;
      default:
        return `Executed ${name}`;
    }
  };

  const handleInsert = (text) => {
    if (editor) {
      // If user has text selected, replace it. Otherwise insert at cursor.
      if (!editor.state.selection.empty) {
        editor.chain().focus().deleteSelection().insertContent(text).run();
      } else {
        editor.chain().focus().insertContent(text).run();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        left: position.x, 
        top: position.y,
        zIndex: 50 
      }}
      className="w-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden max-h-[600px]"
    >
      {/* Header */}
      <div 
        className="bg-gray-100 p-3 flex items-center justify-between"
      >
        <div 
          className="flex items-center gap-2 text-gray-700 font-medium cursor-move"
          onMouseDown={() => setIsDragging(true)}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>AI Assistant</span>
        </div>
        
        {/* Undo/Redo Controls (Editor History) */}
        <div className="flex gap-1">
          <button 
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Model Display (Fixed to 2.5 Flash) */}
        <div className="px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 font-medium cursor-default">
          Gemini 2.5 Flash
        </div>

        
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] bg-gray-50">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content || (msg.isStreaming && <span className="animate-pulse">Thinking...</span>)}
              </div>
              
              {/* Actions for AI messages */}
              {msg.role === 'model' && !msg.isStreaming && (msg.content || msg.actionText) && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex gap-2">
                  <button 
                    onClick={() => handleInsert(msg.actionText || msg.content)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    title="Insert text into editor"
                  >
                    <ArrowRight className="w-3 h-3" /> Insert
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(msg.actionText || msg.content)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-3 bg-white border-t border-gray-100 flex flex-wrap gap-2">
         <button 
           onClick={() => handleSend("Rewrite the selected text or the current document to be more professional and engaging.")}
           className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-full border border-purple-200 hover:bg-purple-100 transition-colors"
         >
           ✨ Enhance Writing
         </button>
         <button 
           onClick={() => handleSend("Fix all grammar, punctuation, and spelling mistakes in the current text.")}
           className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
         >
           🔧 Fix Grammar
         </button>
         <button 
           onClick={() => handleSend("Generate 5 comma-separated tag keywords for this content.")}
           className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition-colors"
         >
           🏷️ Generate Tags
         </button>
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything..."
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-12 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          Powered by Gemini 2.5 Flash
        </div>
      </div>
    </div>
  );
};

export default AIChat;

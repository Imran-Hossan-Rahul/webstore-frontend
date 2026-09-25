"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";

export default function InboxMain() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      // TODO: Implement conversations API
      // const res = await api.get("/messages/conversations");
      // setConversations(res.data);
      
      setConversations([]);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      // TODO: Implement messages API
      // const res = await api.get(`/messages/${conversationId}`);
      // setMessages(res.data);
      
      setMessages([]);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // TODO: Implement send message API
      // await api.post(`/messages/${selectedConversation.id}`, { text: newMessage });
      setNewMessage("");
      fetchMessages(selectedConversation.id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="dashboard absolute left-20 top-16 md:w-[1800px] pr-10">
      <h1 className="text-4xl font-bold text-black mb-8">Inbox</h1>

      <div className="bg-white rounded-[26px] shadow-lg overflow-hidden" style={{ height: "calc(100vh - 250px)" }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-slate-200 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-brand-slate">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-brand-slate">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-brand-cloud ${
                    selectedConversation?.id === conv.id ? "bg-slate-100" : ""
                  }`}
                >
                  <div className="font-semibold text-black">{conv.name}</div>
                  <div className="text-sm text-brand-slate truncate">{conv.lastMessage}</div>
                </div>
              ))
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-black">{selectedConversation.name}</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sent
                            ? "bg-black text-white"
                            : "bg-slate-100 text-black"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-slate-900 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-brand-slate">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


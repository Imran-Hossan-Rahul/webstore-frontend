"use client";

import React, { useEffect } from "react";
import socket from "@/utils/socket";
import { useToast } from "@/components/ui/ToastProvider";
import { useUser } from "@/context/UserContext";

export default function GlobalSocketListener() {
  const { user } = useUser();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user || !user._id) return;

    // Handle new incoming messages
    const handleNewMessage = ({ chatId, message }) => {
      // Don't show toast if we are the sender
      if (message.sender === user._id || message.sender?._id === user._id) return;
      
      // Don't show toast if this chat is currently open in the ChatModal
      if (window.activeChatId === chatId || window.activeChatId === chatId?.toString()) return;

      const senderName = message.sender?.name || message.sender?.username || "Someone";
      
      showToast(
        message.content, 
        "info", 
        `New Message from ${senderName}`, 
        5000
      );
    };

    // Handle incoming general notifications
    const handleNotification = (notification) => {
      let type = "info";
      if (notification.type === "like") type = "success";
      else if (notification.type === "purchase") type = "success";
      
      showToast(
        notification.message,
        type,
        notification.title || "New Notification",
        5000
      );
    };

    // Attach listeners
    socket.on(`user:${user._id}:newMessage`, handleNewMessage);
    socket.on(`user:${user._id}:notification`, handleNotification);

    return () => {
      // Cleanup listeners
      socket.off(`user:${user._id}:newMessage`, handleNewMessage);
      socket.off(`user:${user._id}:notification`, handleNotification);
    };
  }, [user, showToast]);

  return null; // Logic-only component, renders nothing
}

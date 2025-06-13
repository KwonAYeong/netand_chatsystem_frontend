import React, { useEffect, useRef, useState } from "react";
import {
  sendFileMessage,
  getMessages,
  updateLastReadMessage,
} from "../../api/chat";
import Header from "./Header";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ProfileIntro from "./ProfileIntro";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { transform, appendIfNotExistsById } from "../../utils/transform";
import type { Message } from "../../types/message";

interface ChatRoomProps {
  chatRoomId: number;
  userId: number;
  chatRoomName: string;
}

export default function ChatRoom({
  chatRoomId,
  userId,
  chatRoomName,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 메시지 로딩
    getMessages(chatRoomId)
      .then((res) => {
        const transformed = res.data.map(transform);
        setMessages((prev) => appendIfNotExistsById(prev, ...transformed));
      })
      .catch((err) => console.error("❌ 메시지 불러오기 실패:", err));

    // 읽음 처리
    updateLastReadMessage(chatRoomId, userId)
      .then(() => console.log("✅ 읽음 처리 완료"))
      .catch((err) => console.error("❌ 읽음 처리 실패:", err));

    // WebSocket 연결
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("🟢 WebSocket 연결됨");
        setIsConnected(true);

        client.subscribe(`/sub/chatroom/${chatRoomId}`, (message) => {
          const data = JSON.parse(message.body);
          const newMessage = transform(data);
          setMessages((prev) => appendIfNotExistsById(prev, newMessage));
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP 오류:", frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setIsConnected(false);
      setMessages([]);
    };
  }, [chatRoomId]);

  // 파일 업로드 → fileUrl만 받아오기
  const uploadFile = async (file: File): Promise<string> => {
    const res = await sendFileMessage(chatRoomId, userId, file);
    return res.data.fileUrl;
  };

  const handleSend = async (text: string, file?: File) => {
    try {
      let fileUrl: string | undefined;

      if (file) {
        // 파일만 업로드하고 fileUrl만 받음
        const res = await sendFileMessage(chatRoomId, userId, file);
        fileUrl = res.data.fileUrl; 
      }

      const payload = {
        chatRoomId,
        senderId: userId,
        content: text,
        messageType: file ? "FILE" : "TEXT",
        fileUrl,
      };

      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.publish({
          destination: "/pub/chat.sendMessage",
          body: JSON.stringify(payload),
        });
      } else {
        console.warn("⚠️ WebSocket 연결 안됨");
      }
    } catch (err) {
      console.error("❌ 메시지 전송 실패:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header chatRoomName={chatRoomName} />
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <ProfileIntro name={chatRoomName} profileUrl="/default-profile.png" />
        <MessageList messages={messages} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}

"use client"

import { useChat } from "ai/react"
import { AIChat } from "./ai-chat"
import { useTheme } from "next-themes"; // ダークモードのために追加
import { useEffect, useState } from "react";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, reload, setMessages, setInput, append } = useChat();
  const { theme, resolvedTheme } = useTheme(); // resolvedThemeも取得
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでマウント後にのみテーマを適用
  useEffect(() => {
    setMounted(true);
  }, []);

  // AIChatコンポーネントに必要なプロパティを渡す
  // 不要になった onInsertToEditor や getEditorContent は渡さない
  return (
    <div className="h-full">
      {/* 将来的にヘッダーなどを追加する場合はここに */}
      {/* <header>Header</header> */}
      
      <AIChat
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        // handleSubmit は AIChat 内部で直接 form の onSubmit を使う想定かもしれないので一旦削除
        isLoading={isLoading}
        clearMessages={() => setMessages([])} // メッセージクリア機能
        setInput={setInput}
        append={append}
        isDarkMode={mounted ? resolvedTheme === 'dark' : true} // マウント後にのみテーマ情報を使用し、初期状態はダークモード
        // 削除: onInsertToEditor
        // 削除: getEditorContent
      />
      
      {/* 将来的にフッターなどを追加する場合はここに */}
      {/* <footer>Footer</footer> */}
    </div>
  );
} 
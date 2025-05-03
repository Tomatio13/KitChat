// import MarkdownEditor from "@/components/markdown-editor"
import ChatPage from "@/components/chat-page"

export default function Home() {
  return (
    <main className="h-screen bg-background dark:bg-[#0d1117] py-4">
      <div className="h-[calc(100%-2rem)] max-w-[90%] mx-auto">
        <ChatPage />
      </div>
    </main>
  )
}


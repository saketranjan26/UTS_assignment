import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User,RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function ChatInterface({ sessionId, setSessionId }) {

  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI support assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!sessionId) {
      alert("Session not found. Please refresh and start chat again.");
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/v1/chats/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          query: input,
        }),
      });

      const data = await response.json();

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat api connection error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I’m having trouble connecting right now. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleNewSession = () => {
    const sessionId = localStorage.getItem("sessionId");

    const response = fetch("http://localhost:3000/api/v1/session/end-session", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch((err) => {
      console.error("Error ending session:", err);
    });
    
    localStorage.removeItem("sessionId");
    setSessionId(null);
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" color="#1E4AB7" />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">AI Support Assistant</h1>
            <p className="text-sm text-muted-foreground">Always here to help</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 items-start",
                msg.role === "user" && "flex-row-reverse"
              )}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {msg.role === "assistant" ? (
                    <Bot className="w-4 h-4" color="#1E4AB7" />
                  ) : (
                    <User className="w-4 h-4" color="#1E4AB7" />
                  )}
                </AvatarFallback>
              </Avatar>

              <Card
                className={cn(
                  "px-4 py-3 max-w-[85%]",
                  msg.role === "user"
                    ? "bg-[#1E4AB7] text-white"
                    : "bg-card"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </Card>
            </div>
          ))}

          {isLoading && (
            <Card className="px-4 py-3 bg-card">
              <p className="text-sm text-muted-foreground">Typing...</p>
            </Card>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Card className="flex-1 flex items-center px-4 shadow-sm">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full resize-none bg-transparent outline-none"
                rows={1}
                disabled={isLoading}
              />
            </Card>
            <Button
              type="submit"
              size="icon"
              className="h-[52px] w-[52px] shrink-0 bg-[#1E4AB7]"
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="flex justify-center mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNewSession}
              disabled={isLoading}
              className="gap-2 bg-transparent"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Start New Session
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI responses may contain errors. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}

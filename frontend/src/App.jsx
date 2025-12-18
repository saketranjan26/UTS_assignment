import { useEffect, useState } from "react";
import "./App.css";
import { ChatInterface } from "./components/ChatInterface";

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, [sessionId]);

  const startChat = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/v1/session/create-session", {
        method: "POST",
      });

      const data = await res.json();

      localStorage.setItem("sessionId", data.session._id);
      setSessionId(data.sessionId);
    } catch (err) {
      console.error("Failed to start session, may be server issue", err);
      alert("Failed to start chat due to server issue. Please try again.");
    } finally {
      setLoading(false);
      
    }
  };

  if (!sessionId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <button
          onClick={startChat}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white text-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Starting..." : "Start Chat"}
        </button>
      </div>
    );
  }

  return <ChatInterface sessionId={sessionId} setSessionId={setSessionId} />;
}

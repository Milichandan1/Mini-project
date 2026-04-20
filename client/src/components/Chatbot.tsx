import { Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { api } from "../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chatbot({ city }: { city: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ask about AQI, pollutants, masks, outdoor activity, or city comparisons." }
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    const nextQuestion = question.trim();
    setQuestion("");
    setMessages((items) => [...items, { role: "user", content: nextQuestion }]);
    setLoading(true);
    try {
      const { answer } = await api.chat(nextQuestion, city);
      setMessages((items) => [...items, { role: "assistant", content: answer }]);
    } catch {
      setMessages((items) => [...items, { role: "assistant", content: "I could not reach the assistant API right now." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="dashboard-shell p-5">
      <h3 className="section-title">Pollution assistant</h3>
      <div className="mt-4 max-h-72 space-y-3 overflow-auto pr-1">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === "user" ? "chat-bubble user" : "chat-bubble"}>
            {message.content}
          </div>
        ))}
        {loading && <div className="chat-bubble">Thinking through the air data...</div>}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="control min-w-0 flex-1"
          placeholder={`Ask about ${city}`}
        />
        <button className="icon-button" aria-label="Send question">
          <Send size={18} />
        </button>
      </form>
    </section>
  );
}

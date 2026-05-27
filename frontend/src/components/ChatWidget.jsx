import { Info, LoaderCircle, MessageCircle, Plus, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { chatApi } from "../services/api.js";
import { formatCurrency, formatDate } from "../utils/format.js";

const initialMessage = {
  role: "assistant",
  content:
    "¡Hola! Soy el asistente virtual de Corte Perfecto. Puedo ayudarte a reservar una cita o resolver tus dudas.\n\n¿En que puedo ayudarte hoy?"
};

function createConversationId() {
  return `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatWidget({ forcedOpen = false, onCloseRequest }) {
  const [open, setOpen] = useState(forcedOpen);
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const conversationId = useRef(createConversationId());
  const messagesEndRef = useRef(null);

  const isOpen = forcedOpen || open;

  const history = useMemo(
    () =>
      messages.map((message) => ({
        role: message.role,
        content: message.content
      })),
    [messages]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, [messages, loading, isOpen]);

  function closePanel() {
    setOpen(false);
    onCloseRequest?.();
  }

  async function sendMessage(customMessage) {
    const text = String(customMessage || input).trim();

    if (!text || loading) {
      return;
    }

    const userMessage = { role: "user", content: text };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatApi.send({
        message: text,
        history,
        conversationId: conversationId.current,
        activeAppointmentId: activeAppointment?._id || null
      });

      const { reply, appointment } = response.data;
      if (appointment) {
        setActiveAppointment(appointment);
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: reply,
          appointment: appointment || null
        }
      ]);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Ahora mismo no puedo contactar con el asistente local. Revisa LM Studio y vuelve a intentarlo.";
      setMessages((current) => [...current, { role: "assistant", content: message, isError: true }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <div className={`chat-widget ${isOpen ? "is-open" : ""}`}>
      {isOpen ? (
        <section className="chat-panel" aria-label="Asistente Corte Perfecto">
          <header className="chat-header">
            <div className="chat-avatar">
              <MessageCircle size={24} />
            </div>
            <div>
              <h2>Asistente Corte Perfecto</h2>
              <p>
                <span className="online-dot" /> En linea · Powered by IA local
              </p>
            </div>
            <button className="icon-button" type="button" aria-label="Cerrar chat" onClick={closePanel}>
              <X size={22} />
            </button>
          </header>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-row ${message.role}`}>
                <div className="chat-bubble">
                  {message.content.split("\n").map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  {message.appointment ? <AppointmentSummary appointment={message.appointment} /> : null}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="chat-row assistant">
                <div className="chat-bubble typing">
                  <LoaderCircle size={18} className="spin" />
                  Pensando...
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          <div className="quick-actions">
            <button className="chip-button" type="button" onClick={() => sendMessage("Quiero mas informacion")}>
              <Info size={16} />
              Mas informacion
            </button>
          </div>

          <form className="chat-input" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <button className="send-button" type="submit" aria-label="Enviar mensaje" disabled={loading}>
              <Send size={20} />
            </button>
          </form>
        </section>
      ) : (
        <button className="chat-launcher" type="button" aria-label="Abrir chat" onClick={() => setOpen(true)}>
          <MessageCircle size={28} />
          <span>1</span>
        </button>
      )}

      {isOpen ? (
        <button className="chat-mini" type="button" aria-label="Minimizar chat" onClick={closePanel}>
          <Plus size={30} />
        </button>
      ) : null}
    </div>
  );
}

function AppointmentSummary({ appointment }) {
  return (
    <div className="appointment-summary">
      <strong>Cita registrada</strong>
      <span>{appointment.customerName}</span>
      <span>{appointment.service}</span>
      <span>
        {formatDate(appointment.date)} · {appointment.time}
      </span>
      <span>{formatCurrency(appointment.price)}</span>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const [contacts] = useState([
    { id: 1, name: "Andrea López" },
    { id: 2, name: "Carlos Méndez" },
    { id: 3, name: "Laura Torres" },
    { id: 4, name: "Javier Ramírez" },
    { id: 5, name: "Sofía Fernández" },
    { id: 6, name: "Miguel Ángel" },
    { id: 7, name: "Valentina Castro" },
  ]);

  const [selectedContact, setSelectedContact] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
  
const filteredContacts = contacts.filter((contact) =>
    contact.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes(
        searchTerm
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      )
  );

  const Avatar = ({ name }) => {
    const getInitials = (name) => {
      const words = name.split(" ");
      if (words.length === 1) return words[0][0];
      return words[0][0] + words[1][0];
    };

    return (
      <div className="avatar">
        {getInitials(name)}
      </div>
    );
  };

  
  const [messages, setMessages] = useState({
    1: [
      { id: 1, text: "¿Qué tipo de estrategia es mejor?", sender: "received", timestamp: new Date().toLocaleString() }
    ],
    2: [{ id: 1, text: "No te preocupes, yo me encargo de eso mañana temprano.", sender: "received", timestamp: new Date().toLocaleString() }],
    3: [{ id: 1, text: "¡Oye, tengo una buena idea!", sender: "received", timestamp: new Date().toLocaleString() }],
    4: [{ id: 1, text: "Foto", sender: "received", timestamp: new Date().toLocaleString() }],
    5: [
      {
        id: 1,
        text: "En realidad quería consultarte sobre tu plan de negocio online...",
        sender: "received",
        timestamp: new Date().toLocaleString()
      },
    ],
    6: [
      {
        id: 1,
        text: "Te mando el archivo apenas llegue a casa, dame 10 minutos.",
        sender: "received",
        timestamp: new Date().toLocaleString()
      },
    ],
    7: [
      { id: 1, text: "¡Ok, que tengas un buen viaje!", sender: "received", timestamp: new Date().toLocaleString() }
    ],
  });

  const messagesEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (selectedContact) {
      scrollToBottom();
    }
  }, [selectedContact, messages]);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = () => {
    if (!selectedContact || newMessage.trim() === "") return;

    const contactId = selectedContact.id;
    const nextId =
      messages[contactId]?.length > 0
        ? Math.max(...messages[contactId].map((m) => m.id)) + 1
        : 1;

    const updatedMessages = {
      ...messages,
      [contactId]: [
        ...(messages[contactId] || []),
        {
          id: nextId,
          text: newMessage,
          sender: "sent",
          timestamp: new Date().toLocaleString(),
        },
      ],
    };

    setMessages(updatedMessages);
    setNewMessage("");
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  return (
    <div className="app">
      
      <div className="sidebar">
        <button className="theme-toggle" onClick={toggleTheme}>
          {darkMode ? (
            <>
              <span>Modo Claro</span>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM12 18.75a.75.75 0 01-.75-.75v-2.25a.75.75 0 011.5 0v2.25a.75.75 0 01-.75.75zM5.636 5.636a.75.75 0 011.06 0l1.592 1.592a.75.75 0 01-1.06 1.06L5.636 6.698a.75.75 0 010-1.06zm12.728 12.728a.75.75 0 010-1.06l-1.592-1.592a.75.75 0 011.06-1.06l1.592 1.592a.75.75 0 010 1.06zM5.636 18.364a.75.75 0 010-1.06l1.592-1.592a.75.75 0 011.06 1.06l-1.592 1.592a.75.75 0 01-1.06 0zM18.364 5.636a.75.75 0 011.06 0l1.592 1.592a.75.75 0 11-1.06 1.06l-1.592-1.592a.75.75 0 010-1.06z" />
              </svg>
            </>
          ) : (
            <>
              <span>Modo Oscuro</span>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.004 10.745c.03-.596.092-1.19.186-1.778a.75.75 0 10-1.49-.248c-.092.578-.182 1.162-.212 1.743a8.96 8.96 0 01-17.49 0c-.03-.581-.12-1.165-.212-1.743a.75.75 0 10-1.49.248c.094.588.156 1.182.186 1.778a9.01 9.01 0 0117.996 0zM12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zm0 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm-9.75-6a.75.75 0 01-1.5 0h1.5zm19.5 0a.75.75 0 01-1.5 0h1.5zm-17.031-4.22a.75.75 0 011.06-1.06l-1.06 1.06zm14.903 0a.75.75 0 01-1.06 1.06l1.06-1.06zM5.636 16.636a.75.75 0 011.061 0l-1.061-1.061zM18.364 7.364a.75.75 0 011.061 0l-1.061-1.061z" />
              </svg>
            </>
          )}
        </button>

        <h2>Contactos</h2>
<div className="contact-list">
  <input
    type="text"
    placeholder="Buscar contacto..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-input"
  />

  {filteredContacts.length > 0 ? (
    filteredContacts.map((contact) => (
      <div
        key={contact.id}
        className={`contact ${selectedContact?.id === contact.id ? "active" : ""}`}
        onClick={() => handleSelectContact(contact)}
        style={{ display: "flex", alignItems: "center" }}
      >
        <Avatar name={contact.name} />
        <span>{contact.name}</span>
      </div>
    ))
  ) : (
    <p style={{ fontSize: "0.875rem", color: "#9ca3af", textAlign: "center", marginTop: "1rem" }}>
      No se encontraron contactos
    </p>
  )}
</div>

      </div>


      <div className="chat-container">
        {!selectedContact ? (
          <p className="text-gray-500">Selecciona un contacto para comenzar el chat.</p>
        ) : (
          <>
            <h2>{selectedContact.name}</h2>
            <div ref={messagesEndRef} className="messages">
              {messages[selectedContact.id]?.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  {msg.text}
                  <span className="timestamp">{msg.timestamp}</span>
                </div>
              ))}
            </div>
            <div className="input-area">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Enviar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
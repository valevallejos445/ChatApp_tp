import React, { useState, useEffect, useRef, useCallback, useReducer } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./App.css";


const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'SET_TYPING':
      return { 
        ...state, 
        typingUsers: action.payload.isTyping 
          ? [...state.typingUsers.filter(id => id !== action.payload.contactId), action.payload.contactId]
          : state.typingUsers.filter(id => id !== action.payload.contactId)
      };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, { 
          id: Date.now(), 
          ...action.payload 
        }] 
      };
    case 'REMOVE_NOTIFICATION':
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload) 
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    default:
      return state;
  }
};


const initialAppState = {
  loading: false,
  error: null,
  isOnline: navigator.onLine,
  typingUsers: [],
  notifications: []
};


const Avatar = ({ name, isOnline = false, size = "normal" }) => {
  const getInitials = (name) => {
    const words = name.split(" ");
    if (words.length === 1) return words[0][0];
    return words[0][0] + words[1][0];
  };

  const sizeClass = size === "small" ? "avatar-small" : size === "large" ? "avatar-large" : "";

  return (
    <div className={`avatar ${sizeClass}`}>
      {getInitials(name)}
      {isOnline && <div className="online-indicator"></div>}
    </div>
  );
};


const NotificationBadge = ({ count, onClick }) => {
  if (count === 0) return null;
  
  return (
    <div className="notification-badge" onClick={onClick}>
      {count > 99 ? '99+' : count}
    </div>
  );
};

const TypingIndicator = ({ contactName }) => (
  <div className="typing-indicator">
    <span>{contactName} está escribiendo</span>
    <div className="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
);


const ContactList = ({ 
  contacts, 
  selectedContact, 
  onSelectContact, 
  searchTerm, 
  onSearchChange,
  favorites,
  onToggleFavorite,
  unreadCounts,
  typingUsers,
  onlineUsers
}) => {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name'); 

  const filteredContacts = contacts
    .filter((contact) => {
      const matchesSearch = contact.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(
          searchTerm
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        );
      
      const matchesFavorites = showFavoritesOnly ? favorites.includes(contact.id) : true;
      
      return matchesSearch && matchesFavorites;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return (b.lastMessageTime || 0) - (a.lastMessageTime || 0);
        case 'unread':
          return (unreadCounts[b.id] || 0) - (unreadCounts[a.id] || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="contact-list">
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar contacto..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
          aria-label="Buscar contactos"
        />
        
        <div className="contact-filters">
          <button 
            className={`filter-btn ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            aria-label="Mostrar solo favoritos"
          >
            ⭐ Favoritos
          </button>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
            aria-label="Ordenar contactos"
          >
            <option value="name">Por nombre</option>
            <option value="recent">Más recientes</option>
            <option value="unread">No leídos</option>
          </select>
        </div>
      </div>

      {filteredContacts.length > 0 ? (
        filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className={`contact ${selectedContact?.id === contact.id ? "active" : ""}`}
            onClick={() => onSelectContact(contact)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectContact(contact);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Seleccionar contacto ${contact.name}`}
          >
            <div className="contact-avatar-container">
              <Avatar 
                name={contact.name} 
                isOnline={onlineUsers.includes(contact.id)}
              />
              <NotificationBadge 
                count={unreadCounts[contact.id] || 0}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectContact(contact);
                }}
              />
            </div>
            
            <div className="contact-info">
              <div className="contact-header">
                <span className="contact-name">{contact.name}</span>
                <button
                  className={`favorite-btn ${favorites.includes(contact.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(contact.id);
                  }}
                  aria-label={`${favorites.includes(contact.id) ? 'Quitar de' : 'Añadir a'} favoritos`}
                >
                  ⭐
                </button>
              </div>
              
              {typingUsers.includes(contact.id) && (
                <div className="contact-typing">Escribiendo...</div>
              )}
              
              {contact.lastMessage && !typingUsers.includes(contact.id) && (
                <div className="contact-last-message">
                  {contact.lastMessage.length > 30 
                    ? `${contact.lastMessage.substring(0, 30)}...` 
                    : contact.lastMessage
                  }
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="no-contacts-message">
          {showFavoritesOnly ? "No hay contactos favoritos" : "No se encontraron contactos"}
        </p>
      )}
    </div>
  );
};


const Message = ({ message, isDelivered, isRead }) => (
  <div className={`message ${message.sender}`}>
    <div className="message-content">
      {message.text}
      <div className="message-meta">
        <span className="timestamp">{message.timestamp}</span>
        {message.sender === 'sent' && (
          <div className="message-status">
            {isRead ? '✓✓' : isDelivered ? '✓' : '⏳'}
          </div>
        )}
      </div>
    </div>
  </div>
);


const ChatArea = ({ 
  selectedContact, 
  messages, 
  onSendMessage, 
  newMessage, 
  onMessageChange,
  isTyping,
  onTypingChange,
  typingUsers,
  messageStatuses,
  isOnline,
  onBackToContacts
}) => {
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (selectedContact && messages[selectedContact.id]) {
      scrollToBottom();
    }
  }, [selectedContact, messages, scrollToBottom]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
      onTypingChange(false);
    }
  };

  const handleInputChange = (value) => {
    onMessageChange(value);
    
    
    if (value.trim() && !isTyping) {
      onTypingChange(true);
    }
    
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    
    typingTimeoutRef.current = setTimeout(() => {
      onTypingChange(false);
    }, 2000);
  };

  const handleEmojiSelect = (emoji) => {
    onMessageChange(newMessage + emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = ['😀', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥'];

  if (!selectedContact) {
    return (
      <div className="chat-container">
        <div className="no-contact-selected">
          <div className="welcome-message">
            <h3>¡Bienvenido al Chat!</h3>
            <p>Selecciona un contacto para comenzar una conversación.</p>
            <div className="connection-status">
              Estado: {isOnline ? '🟢 Conectado' : '🔴 Desconectado'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        {/* Botón de volver para móviles */}
        {isMobile && (
          <button 
            className="back-button"
            onClick={onBackToContacts}
            aria-label="Volver a contactos"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              marginRight: 'var(--spacing-md)',
              padding: 'var(--spacing-sm)',
              borderRadius: '0.5rem',
              transition: 'background-color var(--transition-fast)'
            }}
          >
            ←
          </button>
        )}
        
        <Avatar name={selectedContact.name} isOnline={true} />
        <div className="chat-header-info">
          <h2>{selectedContact.name}</h2>
          <div className="contact-status">
            {typingUsers.includes(selectedContact.id) ? (
              <TypingIndicator contactName={selectedContact.name} />
            ) : (
              <span className="last-seen">Última vez: hace 5 min</span>
            )}
          </div>
        </div>
        
        <div className="chat-actions">
          <button className="action-btn" aria-label="Llamar">📞</button>
          <button className="action-btn" aria-label="Videollamada">📹</button>
          <button className="action-btn" aria-label="Más opciones">⋮</button>
        </div>
      </div>
      
      <div ref={messagesEndRef} className="messages">
        {messages[selectedContact.id]?.map((msg) => (
          <Message 
            key={msg.id} 
            message={msg}
            isDelivered={messageStatuses[msg.id]?.delivered || false}
            isRead={messageStatuses[msg.id]?.read || false}
          />
        ))}
      </div>
      
      <div className="input-area">
        <div className="input-container">
          <button 
            className="emoji-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-label="Seleccionar emoji"
          >
            😀
          </button>
          
          {showEmojiPicker && (
            <div className="emoji-picker">
              {commonEmojis.map(emoji => (
                <button
                  key={emoji}
                  className="emoji-option"
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Escribir mensaje"
            className="message-input"
          />
          
          <button 
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onMouseLeave={() => setIsRecording(false)}
            aria-label="Grabar audio"
          >
            🎤
          </button>
          
          <button 
            className="attach-btn"
            aria-label="Adjuntar archivo"
          >
            📎
          </button>
        </div>
        
        <button 
          onClick={onSendMessage}
          disabled={!newMessage.trim()}
          aria-label="Enviar mensaje"
          className="send-btn"
        >
          ➤
        </button>
      </div>
    </div>
  );
};


const ThemeToggle = ({ darkMode, onToggle }) => (
  <button 
    className="theme-toggle" 
    onClick={onToggle}
    aria-label={`Cambiar a modo ${darkMode ? 'claro' : 'oscuro'}`}
  >
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
          <path d="M20.004 10.745c.03-.596.092-1.19.186-1.778a.75.75 0 10-1.49-.248c-.092.578-.182 1.162-.212 1.743a8.96 8.96 0 01-17.49 0c-.03-.581-.12-1.165-.212-1.743a.75.75 0 10-1.49.248c.094.588.156 1.182.186 1.778a9.01 9.01 0 0117.996 0z" />
        </svg>
      </>
    )}
  </button>
);


const MobileMenuButton = ({ isOpen, onToggle }) => (
  <button 
    className="mobile-menu-button"
    onClick={onToggle}
    aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
  >
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      {isOpen ? (
        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      ) : (
        <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  </button>
);


const NotificationCenter = ({ notifications, onDismiss, onClearAll }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h3>Notificaciones ({notifications.length})</h3>
        <button onClick={onClearAll} className="clear-all-btn">
          Limpiar todo
        </button>
      </div>
      
      <div className="notification-list">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            <div className="notification-content">
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              <small>{notification.timestamp}</small>
            </div>
            <button 
              onClick={() => onDismiss(notification.id)}
              className="dismiss-btn"
              aria-label="Descartar notificación"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
};


const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};


const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};


const App = () => {

  const { contactId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados básicos
  const [contacts, setContacts] = useState([
    { 
      id: 1, 
      name: "Andrea López", 
      lastMessage: "¿Qué tipo de estrategia es mejor?",
      lastMessageTime: Date.now() - 300000 
    },
    { 
      id: 2, 
      name: "Carlos Méndez", 
      lastMessage: "No te preocupes, yo me encargo",
      lastMessageTime: Date.now() - 600000 
    },
    { 
      id: 3, 
      name: "Laura Torres", 
      lastMessage: "¡Oye, tengo una buena idea!",
      lastMessageTime: Date.now() - 900000 
    },
    { 
      id: 4, 
      name: "Javier Ramírez", 
      lastMessage: "Foto",
      lastMessageTime: Date.now() - 1200000 
    },
    { 
      id: 5, 
      name: "Sofía Fernández", 
      lastMessage: "En realidad quería consultarte...",
      lastMessageTime: Date.now() - 1500000 
    },
    { 
      id: 6, 
      name: "Miguel Ángel", 
      lastMessage: "Te mando el archivo",
      lastMessageTime: Date.now() - 1800000 
    },
    { 
      id: 7, 
      name: "Valentina Castro", 
      lastMessage: "¡Ok, que tengas un buen viaje!",
      lastMessageTime: Date.now() - 2100000 
    },
  ]);

  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Estados avanzados con useReducer
  const [appState, dispatch] = useReducer(appReducer, initialAppState);

  // Estados con localStorage
  const [messages, setMessages] = useLocalStorage("chatMessages", {
    1: [{ id: 1, text: "¿Qué tipo de estrategia es mejor?", sender: "received", timestamp: new Date().toLocaleString() }],
    2: [{ id: 1, text: "No te preocupes, yo me encargo de eso mañana temprano.", sender: "received", timestamp: new Date().toLocaleString() }],
    3: [{ id: 1, text: "¡Oye, tengo una buena idea!", sender: "received", timestamp: new Date().toLocaleString() }],
    4: [{ id: 1, text: "Foto", sender: "received", timestamp: new Date().toLocaleString() }],
    5: [{ id: 1, text: "En realidad quería consultarte sobre tu plan de negocio online...", sender: "received", timestamp: new Date().toLocaleString() }],
    6: [{ id: 1, text: "Te mando el archivo apenas llegue a casa, dame 10 minutos.", sender: "received", timestamp: new Date().toLocaleString() }],
    7: [{ id: 1, text: "¡Ok, que tengas un buen viaje!", sender: "received", timestamp: new Date().toLocaleString() }],
  });

  const [darkMode, setDarkMode] = useLocalStorage("darkMode", false);
  const [favorites, setFavorites] = useLocalStorage("favorites", [1, 3]);
  const [unreadCounts, setUnreadCounts] = useLocalStorage("unreadCounts", { 2: 3, 4: 1, 6: 2 });
  const [messageStatuses, setMessageStatuses] = useLocalStorage("messageStatuses", {});
  const [userSettings, setUserSettings] = useLocalStorage("userSettings", {
    notifications: true,
    soundEnabled: true,
    autoRead: true
  });

  // Estados simulados para usuarios online
  const [onlineUsers, setOnlineUsers] = useState([1, 2, 3, 5, 7]);

  // Hooks personalizados
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isOnline = useOnlineStatus();

  // Efecto para manejar la selección de contacto basada en URL
  useEffect(() => {
    if (contactId) {
      const contact = contacts.find(c => c.id === parseInt(contactId));
      if (contact) {
        setSelectedContact(contact);
        // Marcar mensajes como leídos
        if (unreadCounts[contact.id]) {
          setUnreadCounts(prev => ({
            ...prev,
            [contact.id]: 0
          }));
        }
      } else {
        // Contacto no encontrado, redirigir a la vista principal
        navigate('/', { replace: true });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            type: 'error',
            title: 'Contacto no encontrado',
            message: 'El contacto solicitado no existe',
            timestamp: new Date().toLocaleTimeString()
          }
        });
      }
    } else {
      setSelectedContact(null);
    }
  }, [contactId, contacts, navigate, unreadCounts, setUnreadCounts, dispatch]);

  // Efectos existentes
  useEffect(() => {
    dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline });
  }, [isOnline]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [darkMode]);

  useEffect(() => {
    if (isMobile && selectedContact) {
      setSidebarOpen(false);
    }
  }, [selectedContact, isMobile]);

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Simular usuarios escribiendo
  useEffect(() => {
    const interval = setInterval(() => {
      const randomContact = Math.floor(Math.random() * contacts.length) + 1;
      const isCurrentlyTyping = appState.typingUsers.includes(randomContact);
      
      if (Math.random() > 0.8) { // 20% de probabilidad
        dispatch({ 
          type: 'SET_TYPING', 
          payload: { 
            contactId: randomContact, 
            isTyping: !isCurrentlyTyping 
          } 
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [contacts.length, appState.typingUsers]);

  // Handlers con navegación
  const handleSelectContact = useCallback((contact) => {
    navigate(`/chat/${contact.id}`);
  }, [navigate]);

  const handleBackToContacts = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleSendMessage = useCallback(() => {
    if (!selectedContact || newMessage.trim() === "") return;

    dispatch({ type: 'SET_LOADING', payload: true });

    const contactId = selectedContact.id;
    const nextId = messages[contactId]?.length > 0
      ? Math.max(...messages[contactId].map((m) => m.id)) + 1
      : 1;

    const newMsg = {
      id: nextId,
      text: newMessage.trim(),
      sender: "sent",
      timestamp: new Date().toLocaleString(),
    };

    const updatedMessages = {
      ...messages,
      [contactId]: [
        ...(messages[contactId] || []),
        newMsg
      ],
    };

    setMessages(updatedMessages);
    setNewMessage("");

    // Simular estado de entrega
    setTimeout(() => {
      setMessageStatuses(prev => ({
        ...prev,
        [nextId]: { delivered: true, read: false }
      }));
      
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Notificación de mensaje enviado
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: 'Mensaje enviado',
          message: `Mensaje enviado a ${selectedContact.name}`,
          timestamp: new Date().toLocaleTimeString()
        }
      });
    }, 1000);

    // Simular mensaje leído después de 3 segundos
    setTimeout(() => {
      setMessageStatuses(prev => ({
        ...prev,
        [nextId]: { delivered: true, read: true }
      }));
    }, 3000);

  }, [selectedContact, newMessage, messages, setMessages, setMessageStatuses, dispatch]);

  const handleToggleFavorite = useCallback((contactId) => {
    setFavorites(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  }, [setFavorites]);

  const handleTypingChange = useCallback((typing) => {
    setIsTyping(typing);
    if (selectedContact) {
      dispatch({ 
        type: 'SET_TYPING', 
        payload: { 
          contactId: selectedContact.id, 
          isTyping: typing 
        } 
      });
    }
  }, [selectedContact, dispatch]);

  const toggleTheme = useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode, setDarkMode]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleDismissNotification = useCallback((notificationId) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  }, [dispatch]);

  const handleClearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, [dispatch]);

  // Calcular total de notificaciones no leídas
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="app">
      {/* Indicador de carga global */}
      {appState.loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Botón hamburguesa para móviles */}
      {isMobile && (
        <MobileMenuButton isOpen={sidebarOpen} onToggle={toggleSidebar} />
      )}

      {/* Overlay para cerrar sidebar en móvil */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay active" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} />
          
          <div className="notification-controls">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Ver notificaciones"
            >
              🔔
              {appState.notifications.length > 0 && (
                <NotificationBadge count={appState.notifications.length} />
              )}
            </button>
            
            <div className="connection-indicator">
              {appState.isOnline ? '🟢' : '🔴'}
            </div>
          </div>
        </div>

        <h2>
          Contactos 
          {totalUnread > 0 && (
            <NotificationBadge count={totalUnread} />
          )}
        </h2>
        
        <ContactList
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={handleSelectContact}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          unreadCounts={unreadCounts}
          typingUsers={appState.typingUsers}
          onlineUsers={onlineUsers}
        />

        {/* Centro de notificaciones */}
        {showNotifications && (
          <NotificationCenter
            notifications={appState.notifications}
            onDismiss={handleDismissNotification}
            onClearAll={handleClearAllNotifications}
          />
        )}
      </div>

      {/* Chat Area */}
      <ChatArea
        selectedContact={selectedContact}
        messages={messages}
        onSendMessage={handleSendMessage}
        newMessage={newMessage}
        onMessageChange={setNewMessage}
        isTyping={isTyping}
        onTypingChange={handleTypingChange}
        typingUsers={appState.typingUsers}
        messageStatuses={messageStatuses}
        isOnline={appState.isOnline}
        onBackToContacts={handleBackToContacts}
      />

      {/* Mensaje de error global */}
      {appState.error && (
        <div className="error-toast">
          <span>{appState.error}</span>
          <button onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
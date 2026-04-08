import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CreateEvent from "./CreateEvent";
import ParticipantsModal from "./ParticipantsModal";
import EventChat from "./EventChat";
import { API_BASE_URL } from "../../utils/apiConfig";

const API = process.env.REACT_APP_API_URL;

const EventsList = () => {
  const { user } = useSelector((state) => state.user);

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [hiddenEvents, setHiddenEvents] = useState([]);

  const [lastHidden, setLastHidden] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const [chatEventId, setChatEventId] = useState(null);
  

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("hiddenEvents")) || [];
    setHiddenEvents(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("hiddenEvents", JSON.stringify(hiddenEvents));
  }, [hiddenEvents]);

  // 🔧 UPDATED: added try/catch for safety
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.log("Fetch error:", err); // 🔧 ADDED
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 🔧 UPDATED: added try/catch
  const joinEvent = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/events/${id}/join`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });

      fetchEvents();
    } catch (err) {
      console.log("Join error:", err); // 🔧 ADDED
    }
  };

  const hideEvent = (event) => {
    setRemovingId(event._id);

    setTimeout(() => {
      setHiddenEvents((prev) => [...prev, event._id]);
      setLastHidden(event);
      setRemovingId(null);
    }, 300);
  };

  const undoHide = () => {
    if (!lastHidden) return;

    setHiddenEvents((prev) =>
      prev.filter((id) => id !== lastHidden._id)
    );

    setLastHidden(null);
  };

  return (
    <div className="events-container">

      <CreateEvent onCreated={fetchEvents} />

      <h2 className="events-title">🎉 Events & Gatherings</h2>

      <div className="events-grid">
        {events
          .filter((event) => !hiddenEvents.includes(event._id))
          .map((event) => {
            const isJoined =
              event.participants?.includes(user.uid);

            return (
              <div
                key={event._id}
                className={`event-card-wrapper ${
                  removingId === event._id ? "removing" : ""
                }`}
              >
                <div className="event-card">

                  {event.image && event.image !== "" && (
                    <img
                      src={`${API}/uploads/${event.image}`}
                      alt="event"
                      className="event-banner"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}

                  <div className="event-content">
                    <h3 className="event-title">{event.title}</h3>

                    <p className="event-description">{event.description}</p>

                    <div className="event-meta">
                      <span className="meta-item">
                        📅 {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="meta-item">📍 {event.location}</span>
                    </div>

                    <p
                      className="participants-count"
                      onClick={() => setSelectedEvent(event)}
                    >
                      👥 <strong>{event.participants?.length || 0}</strong> joined
                    </p>

                    <div className="event-actions">
                      <button
                        className={`event-btn ${isJoined ? "joined" : "join"}`}
                        onClick={() => joinEvent(event._id)}
                        disabled={isJoined}
                      >
                        {isJoined ? "✅ Joined" : "Join Event"}
                      </button>

                      <button
                        className="event-btn chat"
                        onClick={() => setChatEventId(event._id)}
                      >
                        💬 Chat
                      </button>

                      <button
                        className="event-btn not-interested"
                        onClick={() => hideEvent(event)}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* PARTICIPANTS MODAL */}
      {selectedEvent && (
        <ParticipantsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* CHAT UI */}
      {chatEventId !== null && (
      <EventChat
      key={chatEventId}
      eventId={chatEventId}
      onClose={() => setChatEventId(null)}
      />
)}

      {/* UNDO TOAST */}
      {lastHidden && (
        <div className="undo-toast">
          <span>📛 Event hidden</span>
          <button onClick={undoHide}>Undo</button>
        </div>
      )}

    </div>
  );
};

export default EventsList;
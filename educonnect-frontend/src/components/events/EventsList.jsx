import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CreateEvent from "./CreateEvent";
import ParticipantsModal from "./ParticipantsModal";
import EventChat from "./EventChat";

const EventsList = () => {
  const { user } = useSelector((state) => state.user);
  const API = "http://localhost:5000";

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
      const res = await fetch(`${API}/api/events`);
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
      await fetch(`${API}/api/events/${id}/join`, {
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

      <h2>🎉 Events</h2>

      {events
        .filter((event) => !hiddenEvents.includes(event._id))
        .map((event) => {
          const isJoined =
            event.participants?.includes(user.uid);

          return (
            <div
              key={event._id}
              className={`event-card ${
                removingId === event._id ? "removing" : ""
              }`}
            >

              {/* 🔧 UPDATED: added image fallback safety */}
              {event.image && event.image !== "" && ( // 🔧 ADDED condition
                <img
                  src={`${API}/uploads/${event.image}`}
                  alt="event"
                  className="event-banner"
                  onError={(e) => { // 🔧 ADDED fallback
                    e.target.style.display = "none";
                  }}
                />
              )}

              <h3>{event.title}</h3>

              <p>{event.description}</p>

              <div className="event-meta">
                <span>
                  📅 {new Date(event.date).toLocaleDateString()}
                </span>
                <span>📍 {event.location}</span>
              </div>

              <p
                className="participants clickable"
                onClick={() => setSelectedEvent(event)}
              >
                👥 {event.participants?.length || 0} joined
              </p>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className={isJoined ? "joined-btn" : "join-btn"}
                  onClick={() => joinEvent(event._id)}
                  disabled={isJoined}
                >
                  {/* 🔧 FIXED text consistency */}
                  {isJoined ? "Joined ✅" : "Join Event"} 
                </button>

                <button
                  className="hide-btn"
                  onClick={() => hideEvent(event)}
                >
                  ❌ Not Interested
                </button>

                {/* 🔧 UPDATED: better UX label */}
                <button 
                    className="join-btn"
                  onClick={() => setChatEventId(event._id)}
                >
                  💬 Chat
                </button>

              </div>

            </div>
          );
        })}

      {/* PARTICIPANTS MODAL */}
      {selectedEvent && (
        <ParticipantsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* 🔧 ADDED: CHAT UI rendering */}
      {chatEventId && ( // 🔧 THIS WAS MISSING IN YOUR CODE
        <EventChat eventId={chatEventId} />
      )}

      {/* UNDO TOAST */}
      {lastHidden && (
        <div className="undo-toast">
          Event hidden
          <button onClick={undoHide}>Undo</button>
        </div>
      )}

    </div>
  );
};

export default EventsList;
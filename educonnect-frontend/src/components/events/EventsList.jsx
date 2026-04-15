import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CreateEvent from "./CreateEvent";
import ParticipantsModal from "./ParticipantsModal";
import EventChat from "./EventChat";
import ProgressBar from "../common/ProgressBar";
import SkeletonCard from "../common/SkeletonCard";
import { API_BASE_URL } from "../../utils/apiConfig";

const EventsList = () => {
  const { user } = useSelector((state) => state.user);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 🔧 FIXED: Proper API response extraction & error handling
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/events`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      // Extract events array from response structure: { success, message, data: { events, pagination } }
      const eventsList = data?.data?.events || [];

      if (!Array.isArray(eventsList)) {
        console.warn("Events response is not an array:", eventsList);
        setEvents([]);
      } else {
        setEvents(eventsList);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError(err.message || "Failed to load events");
      setEvents([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 🔧 FIXED: Added proper error handling
  const joinEvent = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${id}/join`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user?.uid }),
      });

      if (!res.ok) {
        throw new Error(`Failed to join event: ${res.statusText}`);
      }

      fetchEvents();
    } catch (err) {
      console.error("Join event error:", err);
      alert("Failed to join event");
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
      {/* Progress Bar for initial load */}
      <ProgressBar visible={loading} duration={2000} />

      <CreateEvent onCreated={fetchEvents} />

      <h2 className="events-title">🎉 Events & Gatherings</h2>

      {/* Loading State - Skeleton Cards */}
      {loading && (
        <div className="events-grid">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={`skeleton-${i}`} type="event" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="events-error">
          <div className="error-icon">⚠️</div>
          <h3>Failed to load events</h3>
          <p>{error}</p>
          <button onClick={fetchEvents} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      )}

      {/* Events Grid - Defensive checks */}
      {!loading && !error && Array.isArray(events) && events.length > 0 && (
        <div className="events-grid">
          {events
            .filter((event) => !hiddenEvents.includes(event?._id))
            .map((event) => {
              if (!event?._id) return null;

              const isJoined = event?.participants?.includes(user?.uid);

              return (
                <div
                  key={event._id}
                  className={`event-card-wrapper ${
                    removingId === event._id ? "removing" : ""
                  }`}
                >
                  <div className="event-card">

                    {event?.image && event.image !== "" && (
                      <img
                        src={`${API_BASE_URL}/uploads/${event.image}`}
                        alt="event"
                        className="event-banner"
                        onError={(e) => {
                          console.warn("Event image failed to load:", event.image);
                          e.target.style.display = "none";
                        }}
                      />
                    )}

                    <div className="event-content">
                      <h3 className="event-title">{event?.title || "Untitled Event"}</h3>

                      <p className="event-description">{event?.description || "No description"}</p>

                      <div className="event-meta">
                        <span className="meta-item">
                          📅 {event?.date ? new Date(event.date).toLocaleDateString() : "TBD"}
                        </span>
                        <span className="meta-item">📍 {event?.location || "Location TBD"}</span>
                      </div>

                      <p
                        className="participants-count"
                        onClick={() => setSelectedEvent(event)}
                        style={{ cursor: "pointer" }}
                      >
                        👥 <strong>{event?.participants?.length || 0}</strong> joined
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
      )}

      {/* Empty State */}
      {!loading && !error && (!Array.isArray(events) || events.length === 0) && (
        <div className="empty-events">
          <div className="empty-icon">📭</div>
          <h3>No events available</h3>
          <p>Check back later for upcoming events!</p>
        </div>
      )}

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
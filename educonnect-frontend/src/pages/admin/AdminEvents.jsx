import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

const API = "http://localhost:5000";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    const res = await fetch(`${API}/api/admin/events`, {
      headers: { email: "admin@educonnect.com" }
    });
    const data = await res.json();
    setEvents(data);
  };

  const deleteEvent = async (id) => {
    await fetch(`${API}/api/admin/events/${id}`, {
      method: "DELETE",
      headers: { email: "admin@educonnect.com" }
    });

    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <AdminLayout>
      <h2>Events</h2>

      {events.map(event => (
        <div key={event._id}>
          {event.title}
          <button onClick={() => deleteEvent(event._id)}>Delete</button>
        </div>
      ))}
    </AdminLayout>
  );
};

export default AdminEvents;
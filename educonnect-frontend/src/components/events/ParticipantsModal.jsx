import { useEffect, useState } from "react";

const ParticipantsModal = ({ event, onClose }) => {
  const API = "http://localhost:5000";

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await fetch(`${API}/api/users`);
        const data = await res.json();

        const filtered = data.filter((u) =>
          event.participants.includes(u.uid)
        );

        setUsers(filtered);
      } catch (err) {
        console.log(err);
      }
    };

    fetchParticipants();
  }, [event]);

  return (
    <div className="modal-overlay" onClick={onClose}>

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h3>👥 Participants ({users.length})</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="participants-list">
          {users.length === 0 ? (
            <p className="empty-state">No participants yet</p>
          ) : (
            users.map((u) => (
              <div key={u.uid} className="participant-item">
                <div className="participant-avatar">
                  {u.name?.charAt(0) || "U"}
                </div>
                <div className="participant-info">
                  <p className="participant-name">{u.name || u.email}</p>
                  <p className="participant-email">{u.email}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="modal-close-btn" onClick={onClose}>Close</button>

      </div>
    </div>
  );
};

export default ParticipantsModal;
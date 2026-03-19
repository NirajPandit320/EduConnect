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
    <div className="modal-overlay">

      <div className="modal">

        <h3>Participants</h3>

        {users.map((u) => (
          <div key={u.uid} className="participant">
            <div className="avatar">
              {u.name?.charAt(0) || "U"}
            </div>
            <span>{u.name || u.email}</span>
          </div>
        ))}

        <button onClick={onClose}>Close</button>

      </div>
    </div>
  );
};

export default ParticipantsModal;
import { useState } from "react";
import AdminLayout from "./AdminLayout";

const API = "http://localhost:5000";

const AdminNotification = () => {
  const [text, setText] = useState("");

  const sendNotification = async () => {
    try {
      await fetch(`${API}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          email: "admin@educonnect.com",
        },
        body: JSON.stringify({ text }),
      });

      alert("Notification sent");
      setText("");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AdminLayout>
      <h2>Send Notification</h2>

      <textarea
        placeholder="Enter notification..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "300px", height: "100px" }}
      />

      <br /><br />

      <button onClick={sendNotification}>
        Send Notification
      </button>
    </AdminLayout>
  );
};

export default AdminNotification;
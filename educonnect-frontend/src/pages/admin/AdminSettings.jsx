import { useState } from "react";
import AdminLayout from "./AdminLayout";

const API = "http://localhost:5000";

const AdminSettings = () => {
  const [announcement, setAnnouncement] = useState("");

  const updateSettings = async () => {
    try {
      await fetch(`${API}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          email: "admin@educonnect.com",
        },
        body: JSON.stringify({ announcement }),
      });

      alert("Settings updated");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AdminLayout>
      <h2>Settings</h2>

      <textarea
        placeholder="Global Announcement"
        value={announcement}
        onChange={(e) => setAnnouncement(e.target.value)}
        style={{ width: "300px", height: "100px" }}
      />

      <br /><br />

      <button onClick={updateSettings}>
        Save
      </button>
    </AdminLayout>
  );
};

export default AdminSettings;
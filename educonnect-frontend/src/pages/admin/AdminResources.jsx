import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

const API = "http://localhost:5000";

const AdminResource = () => {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const fetchResources = async () => {
    const res = await fetch(`${API}/api/resources`);
    const data = await res.json();
    setResources(data);
  };

  const uploadResource = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    await fetch(`${API}/api/resources`, {
      method: "POST",
      headers: {
        email: "admin@educonnect.com",
      },
      body: formData,
    });

    setTitle("");
    setFile(null);
    fetchResources();
  };

  const deleteResource = async (id) => {
    await fetch(`${API}/api/resources/${id}`, {
      method: "DELETE",
      headers: { email: "admin@educonnect.com" },
    });

    fetchResources();
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <AdminLayout>
      <h2>Resources</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={uploadResource}>Upload</button>

      <hr />

      {resources.map((r) => (
        <div key={r._id}>
          {r.title}
          <button onClick={() => deleteResource(r._id)}>
            Delete
          </button>
        </div>
      ))}
    </AdminLayout>
  );
};

export default AdminResource;
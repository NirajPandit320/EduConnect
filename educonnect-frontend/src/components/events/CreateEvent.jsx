import { useState } from "react";
import { useSelector } from "react-redux";

const CreateEvent = ({ onCreated }) => {
  const { user } = useSelector((state) => state.user);
  const API = "http://localhost:5000";

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const createEvent = async () => {
  const formData = new FormData();

  formData.append("title", form.title);
  formData.append("description", form.description);
  formData.append("date", form.date);
  formData.append("location", form.location);
  formData.append("uid", user.uid); // 🔴 MUST be uid

  if (image) {
    formData.append("image", image);
  }

  await fetch("http://localhost:5000/api/events", {
    method: "POST",
    body: formData,
  });

  onCreated();
};

  return (
    <div className="event-form">

      <h3>Create Event</h3>

      <input
        name="title"
        placeholder="Event title"
        value={form.title}
        onChange={handleChange}
      />

      <input
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
      />

      <input
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
      />

      {/* IMAGE UPLOAD */}
      <input type="file" accept="image/*" onChange={handleImage} />

      {/* PREVIEW */}
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="event-preview"
        />
      )}

      <button onClick={createEvent}>
        Create Event
      </button>

    </div>
  );
};

export default CreateEvent;
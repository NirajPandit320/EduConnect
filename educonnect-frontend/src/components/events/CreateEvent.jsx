import { useState } from "react";
import { useSelector } from "react-redux";

const CreateEvent = ({ onCreated }) => {
  const { user } = useSelector((state) => state.user);

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
  formData.append("uid", user.uid); //  MUST be uid

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
    <div className="event-form-container">
      <div className="event-form">

        <h3 className="form-title">✨ Create New Event</h3>

        <div className="form-group">
          <label>Event Title</label>
          <input
            name="title"
            placeholder="Enter event title..."
            value={form.title}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            placeholder="Describe your event..."
            value={form.description}
            onChange={handleChange}
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              name="location"
              placeholder="Event location..."
              value={form.location}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              hidden
            />
            📸 Upload Event Banner
          </label>
        </div>

        {preview && (
          <div className="preview-container">
            <img src={preview} alt="preview" className="event-preview" />
          </div>
        )}

        <button onClick={createEvent} className="create-event-btn">
          🚀 Create Event
        </button>

      </div>
    </div>
  );
};

export default CreateEvent;
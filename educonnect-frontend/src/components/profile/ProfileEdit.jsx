import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../utils/apiConfig";

const ProfileEdit = () => {
  const { user } = useSelector((state) => state.user);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    branch: "",
    year: "",
    sapId: "",
    skills: "",
    interests: "",
    githubUrl: "",
    linkedinUrl: "",
    resumeUrl: "",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      const response = await fetch(`${API_BASE_URL}/api/users/profile/${user.uid}`);
      const data = await response.json();
      const profile = data?.user;

      if (!profile) return;

      setForm({
        name: profile.name || "",
        bio: profile.bio || "",
        branch: profile.branch || "",
        year: profile.year || "",
        sapId: profile.sapId || "",
        skills: Array.isArray(profile.skills) ? profile.skills.join(",") : "",
        interests: Array.isArray(profile.interests) ? profile.interests.join(",") : "",
        githubUrl: profile.githubUrl || "",
        linkedinUrl: profile.linkedinUrl || "",
        resumeUrl: profile.resumeUrl || "",
      });
    };

    load();
  }, [user?.uid]);

  const save = async () => {
    if (!user?.uid) return;

    setStatus("Saving...");

    const payload = {
      ...form,
      skills: form.skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      interests: form.interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      year: form.year ? Number(form.year) : undefined,
      sapId: form.sapId ? Number(form.sapId) : undefined,
    };

    const response = await fetch(`${API_BASE_URL}/api/users/profile/${user.uid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data?.message || "Update failed");
      return;
    }

    setStatus("Profile updated");
  };

  return (
    <div className="profile-edit-card">
      <h3>Edit Profile</h3>
      <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" />
      <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Bio" rows={3} />
      <input value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })} placeholder="Branch" />
      <input value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} placeholder="Year" />
      <input value={form.sapId} onChange={(event) => setForm({ ...form, sapId: event.target.value })} placeholder="SAP ID" />
      <input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="Skills (comma separated)" />
      <input value={form.interests} onChange={(event) => setForm({ ...form, interests: event.target.value })} placeholder="Interests (comma separated)" />
      <input value={form.githubUrl} onChange={(event) => setForm({ ...form, githubUrl: event.target.value })} placeholder="GitHub URL" />
      <input value={form.linkedinUrl} onChange={(event) => setForm({ ...form, linkedinUrl: event.target.value })} placeholder="LinkedIn URL" />
      <input value={form.resumeUrl} onChange={(event) => setForm({ ...form, resumeUrl: event.target.value })} placeholder="Resume URL" />

      <button type="button" onClick={save}>Save Profile</button>
      {status ? <p>{status}</p> : null}
    </div>
  );
};

export default ProfileEdit;

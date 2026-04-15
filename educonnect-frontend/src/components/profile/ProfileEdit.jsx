import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { API_BASE_URL } from "../../utils/apiConfig";
import { setUser } from "../../store/userSlice";
import {
  COURSE_OPTIONS,
  getCourseYearOptions,
  normalizeSkillsInput,
  normalizeUrlInput,
  skillsToInputValue,
} from "../../utils/profileUtils";

const ProfileEdit = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    branch: "",
    year: "",
    sapId: "",
    skills: "",
    githubUrl: "",
    linkedinUrl: "",
    resumeUrl: "",
  });
  const [status, setStatus] = useState("");

  const yearOptions = getCourseYearOptions(form.branch);

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
        year: profile.year ? String(profile.year) : "",
        sapId: profile.sapId ? String(profile.sapId) : "",
        skills: skillsToInputValue(profile.skills),
        githubUrl: profile.githubUrl || "",
        linkedinUrl: profile.linkedinUrl || "",
        resumeUrl: profile.resumeUrl || "",
      });
    };

    load();
  }, [user?.uid]);

  useEffect(() => {
    if (!form.branch) return;
    if (!form.year) return;

    const nextYear = Number(form.year);
    if (yearOptions.includes(nextYear)) return;

    setForm((prev) => ({ ...prev, year: "" }));
  }, [form.branch, form.year, yearOptions]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    if (!user?.uid) return;

    setStatus("Saving...");

    const payload = {
      name: form.name.trim(),
      bio: form.bio.trim(),
      branch: form.branch,
      year: form.year ? Number(form.year) : null,
      sapId: form.sapId.trim() ? Number(form.sapId.trim()) : null,
      skills: normalizeSkillsInput(form.skills),
      githubUrl: normalizeUrlInput(form.githubUrl),
      linkedinUrl: normalizeUrlInput(form.linkedinUrl),
      resumeUrl: normalizeUrlInput(form.resumeUrl),
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

    if (data?.user) {
      dispatch(setUser(data.user));
      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: data.user,
        })
      );
    }

    setStatus("Profile updated");
  };

  return (
    <div className="profile-edit-card">
      <h3>Edit Profile</h3>
      <input
        value={form.name}
        onChange={(event) => updateField("name", event.target.value)}
        placeholder="Full Name"
      />
      <textarea
        value={form.bio}
        onChange={(event) => updateField("bio", event.target.value)}
        placeholder="Bio"
        rows={3}
      />
      <select
        value={form.branch}
        onChange={(event) => updateField("branch", event.target.value)}
      >
        <option value="">Select Course</option>
        {COURSE_OPTIONS.map((course) => (
          <option key={course.value} value={course.value}>
            {course.label}
          </option>
        ))}
      </select>
      <select
        value={form.year}
        onChange={(event) => updateField("year", event.target.value)}
        disabled={!form.branch}
      >
        <option value="">{form.branch ? "Select Year" : "Select Course First"}</option>
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            Year {year}
          </option>
        ))}
      </select>
      <input
        value={form.sapId}
        onChange={(event) => updateField("sapId", event.target.value)}
        placeholder="SAP ID"
        inputMode="numeric"
        pattern="[0-9]*"
      />
      <input
        value={form.skills}
        onChange={(event) => updateField("skills", event.target.value)}
        placeholder="Skills (space separated)"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        enterKeyHint="done"
      />
      <input
        type="url"
        value={form.githubUrl}
        onChange={(event) => updateField("githubUrl", event.target.value)}
        placeholder="GitHub URL"
        inputMode="url"
      />
      <input
        type="url"
        value={form.linkedinUrl}
        onChange={(event) => updateField("linkedinUrl", event.target.value)}
        placeholder="LinkedIn URL"
        inputMode="url"
      />
      <input
        type="url"
        value={form.resumeUrl}
        onChange={(event) => updateField("resumeUrl", event.target.value)}
        placeholder="Resume URL"
        inputMode="url"
      />

      <button type="button" onClick={save}>Save Profile</button>
      {status ? <p>{status}</p> : null}
    </div>
  );
};

export default ProfileEdit;

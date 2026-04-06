import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Settings = () => {
  const { user } = useSelector((state) => state.user);

  const [settings, setSettings] = useState({
    appearance: {
      theme: "light",
      color: "indigo",
      fontSize: "medium",
    },
    notifications: {
      messages: true,
      likes: true,
      comments: true,
      events: true,
      email: false,
    },
    privacy: {
      profileVisibility: "public",
    },
    preferences: {
      language: "en",
      timezone: "Asia/Kolkata",
    },
  });

  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;

      const response = await fetch(`http://localhost:5000/api/users/profile/${user.uid}`);
      const data = await response.json();

      if (data?.user?.settings) {
        setSettings((prev) => ({
          ...prev,
          ...data.user.settings,
          appearance: { ...prev.appearance, ...data.user.settings.appearance },
          notifications: { ...prev.notifications, ...data.user.settings.notifications },
          privacy: { ...prev.privacy, ...data.user.settings.privacy },
          preferences: { ...prev.preferences, ...data.user.settings.preferences },
        }));
      }
    };

    load();
  }, [user?.uid]);

  const save = async () => {
    if (!user?.uid) return;

    setStatus("Saving...");

    const response = await fetch(`http://localhost:5000/api/users/settings/${user.uid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });

    if (!response.ok) {
      setStatus("Save failed");
      return;
    }

    setStatus("Settings updated");
  };

  return (
    <div className="settings-card">
      <h2>Settings</h2>

      <section>
        <h4>Appearance</h4>
        <label>
          Theme
          <select
            value={settings.appearance.theme}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                appearance: { ...prev.appearance, theme: event.target.value },
              }))
            }
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        <label>
          Font Size
          <select
            value={settings.appearance.fontSize}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                appearance: { ...prev.appearance, fontSize: event.target.value },
              }))
            }
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
      </section>

      <section>
        <h4>Notifications</h4>
        {Object.keys(settings.notifications).map((key) => (
          <label key={key} className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.notifications[key]}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    [key]: event.target.checked,
                  },
                }))
              }
            />
            {key}
          </label>
        ))}
      </section>

      <section>
        <h4>Privacy</h4>
        <label>
          Profile Visibility
          <select
            value={settings.privacy.profileVisibility}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                privacy: {
                  ...prev.privacy,
                  profileVisibility: event.target.value,
                },
              }))
            }
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
      </section>

      <section>
        <h4>Preferences</h4>
        <label>
          Language
          <input
            value={settings.preferences.language}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                preferences: { ...prev.preferences, language: event.target.value },
              }))
            }
          />
        </label>

        <label>
          Timezone
          <input
            value={settings.preferences.timezone}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                preferences: { ...prev.preferences, timezone: event.target.value },
              }))
            }
          />
        </label>
      </section>

      <button type="button" onClick={save}>Save Settings</button>
      {status ? <p>{status}</p> : null}
    </div>
  );
};

export default Settings;

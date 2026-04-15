import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../utils/apiConfig";
import {
  getProfileCompletion,
  getYearLabel,
} from "../../utils/profileUtils";

const ProfileView = () => {
  const { user } = useSelector((state) => state.user);

  const [profile, setProfile] = useState(user || null);
  const [stats, setStats] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.uid) return;

    const response = await fetch(`${API_BASE_URL}/api/users/profile/${user.uid}`);
    const data = await response.json();
    setProfile(data?.user || null);
  }, [user?.uid]);

  const fetchStats = useCallback(async () => {
    if (!user?.uid) return;

    const response = await fetch(`${API_BASE_URL}/api/users/profile/${user.uid}/stats`);
    const data = await response.json();
    setStats(data?.stats || null);
  }, [user?.uid]);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [fetchProfile, fetchStats]);

  useEffect(() => {
    setProfile((prev) => ({
      ...(prev || {}),
      ...(user || {}),
    }));
  }, [user]);

  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event.detail) {
        setProfile(event.detail);
      }
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, []);

  if (!profile) return <p>Loading profile...</p>;

  const profileCompletion = getProfileCompletion(profile);

  return (
    <div className="profile-page-wrap">
      <div className="profile-card-main">
        <h2>{profile.name}</h2>
        <p>{profile.email}</p>
        <p>{profile.bio || "Add a bio from your profile edit panel."}</p>

        <div className="profile-meta-grid">
          <div>Course: {profile.branch || "-"}</div>
          <div>Year: {getYearLabel(profile.year) || "-"}</div>
          <div>SAP ID: {profile.sapId || "-"}</div>
          <div>Points: {profile.points || 0}</div>
        </div>

        <div className="profile-meta-grid">
          <div>Profile Completion: {profileCompletion.percentage}%</div>
          <div>
            Skills: {Array.isArray(profile?.skills) && profile.skills.length ? profile.skills.join(", ") : "-"}
          </div>
        </div>

        <div className="profile-links">
          {profile.githubUrl ? <a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a> : null}
          {profile.linkedinUrl ? <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a> : null}
          {profile.resumeUrl ? <a href={profile.resumeUrl} target="_blank" rel="noreferrer">Resume</a> : null}
        </div>
      </div>

      {stats ? (
        <div className="profile-stats-card">
          <h3>Activity</h3>
          <p>Posts: {stats.postsCreated}</p>
          <p>Resources: {stats.resourcesUploaded}</p>
          <p>Events Joined: {stats.eventsJoined}</p>
          <p>Leaderboard Points: {stats.leaderboardPoints}</p>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileView;

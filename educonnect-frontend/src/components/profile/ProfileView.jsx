import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ProfileView = () => {
  const { user } = useSelector((state) => state.user);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchProfile = async () => {
    if (!user?.uid) return;

    const response = await fetch(`http://localhost:5000/api/users/profile/${user.uid}`);
    const data = await response.json();
    setProfile(data?.user || null);
  };

  const fetchStats = async () => {
    if (!user?.uid) return;

    const response = await fetch(`http://localhost:5000/api/users/profile/${user.uid}/stats`);
    const data = await response.json();
    setStats(data?.stats || null);
  };

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [user?.uid]);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="profile-page-wrap">
      <div className="profile-card-main">
        <h2>{profile.name}</h2>
        <p>{profile.email}</p>
        <p>{profile.bio || "Add a bio from your profile edit panel."}</p>

        <div className="profile-meta-grid">
          <div>Branch: {profile.branch || "-"}</div>
          <div>Year: {profile.year || "-"}</div>
          <div>SAP ID: {profile.sapId || "-"}</div>
          <div>Points: {profile.points || 0}</div>
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

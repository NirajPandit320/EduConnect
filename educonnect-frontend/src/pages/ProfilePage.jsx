import ProfileView from "../components/profile/ProfileView";
import ProfileEdit from "../components/profile/ProfileEdit";

export default function ProfilePage() {
  return (
    <div className="profile-page">
      <ProfileView />
      <ProfileEdit />
    </div>
  );
}
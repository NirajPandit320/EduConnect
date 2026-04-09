import { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import PostsList from "../components/posts/PostsList";
import DashboardOverview from "../components/dashboard/DashboardOverview";
import EventsList from "../components/events/EventsList";
import Quiz from "../components/quizzes/Quiz";
import ChatPage from "../components/chat/ChatPage";
import NotificationPanel from "../components/notification/NotificationPanel";
import ResourcesPage from "./ResourcesPage";
import LeaderboardPage from "./LeaderboardPage";
import PlacementPage from "./PlacementPage";
import ProfilePage from "./ProfilePage";
import SettingsPage from "./SettingsPage";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const SUPPORTED_PAGES = new Set([
  "dashboard",
  "posts",
  "events",
  "quizzes",
  "chat",
  "resources",
  "leaderboard",
  "placement",
  "profile",
  "settings",
  "notifications",
]);

const RootPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useSelector((state) => state.user);

  const routePage = (location.pathname || "/dashboard").replace("/", "");
  const activePage = SUPPORTED_PAGES.has(routePage) ? routePage : "dashboard";

  const setActivePage = (page) => {
    const target = SUPPORTED_PAGES.has(page) ? page : "dashboard";
    navigate(`/${target}`);
  };
  

  const renderContent = () => {
    switch (activePage) {
      case "posts":
        return <PostsList />;
      case "events":
        return <EventsList />;
      case "quizzes":
        return <Quiz />;
      case "chat":
        return <ChatPage />;
      case "resources":
        return <ResourcesPage />;
      case "leaderboard":
        return <LeaderboardPage />;
      case "placement":
        return <PlacementPage />;
      case "profile":
        return <ProfilePage />;
      case "settings":
        return <SettingsPage />;
      case "notifications":
        return <NotificationPanel user={user} />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className={`dashboard-layout ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default RootPage;
import { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import PostsList from "../components/posts/PostsList";
import DashboardOverview from "../components/dashboard/DashboardOverview";
import EventsList from "../components/events/EventsList";


const RootPage = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderContent = () => {
    switch (activePage) {
      case "posts":
        return <PostsList />;
      case "events":
        return <EventsList />;
      case "quizzes":
        return <h2>Quizzes Module</h2>;
      case "chat":
        return <h2>Chat System</h2>;
      case "audio":
        return <h2>Audio Call Feature</h2>;
      case "video":
        return <h2>Video Call Feature</h2>;
      case "notifications":
        return <h2>Notifications</h2>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="dashboard-layout">
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
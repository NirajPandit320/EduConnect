import { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import PostsList from "../components/posts/PostsList";
import DashboardOverview from "../components/dashboard/DashboardOverview";
import EventsList from "../components/events/EventsList";
import Quiz from "../components/quizzes/Quiz";
import ChatPage from "../components/chat/ChatPage";


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
        return <Quiz />;
      case "chat":
        return <ChatPage />;
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
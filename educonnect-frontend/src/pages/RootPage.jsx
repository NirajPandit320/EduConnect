import { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import PostsList from "../components/posts/PostsList";
import DashboardOverview from "../components/dashboard/DashboardOverview";
import EventsList from "../components/events/EventsList";
import Quiz from "../components/quizzes/Quiz";
import ChatPage from "../components/chat/ChatPage";
import NotificationPanel from "../components/notification/NotificationPanel";
import { useSelector } from "react-redux";


const RootPage = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useSelector((state) => state.user);
  

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
        return <NotificationPanel user={user} />;
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
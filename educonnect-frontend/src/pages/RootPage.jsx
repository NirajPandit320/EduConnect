import { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import PostsList from "../components/posts/PostsList";

const RootPage = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(false);

  const renderContent = () => {
    switch (activePage) {
      case "posts":
        return <PostsList />;
      case "events":
        return <h2>Event Registration (Coming Soon)</h2>;
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
        return <h2>Dashboard Overview</h2>;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        setActivePage={setActivePage}
        activePage={activePage}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div className="main-content">{renderContent()}</div>
    </div>
  );
};

export default RootPage;
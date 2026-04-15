import Sidebar from "../../components/admin/Sidebar";
import "../../styles/admin.css";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-container">
      <Sidebar />
      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
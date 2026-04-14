import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

const API = "http://localhost:5000";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch(`${API}/api/admin/users`, {
      headers: { email: "admin@educonnect.com" }
    });
    const data = await res.json();
    setUsers(data);
  };

  const deleteUser = async (id) => {
    await fetch(`${API}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { email: "admin@educonnect.com" }
    });

    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <h2>Users</h2>

      {users.map(user => (
        <div key={user._id}>
          {user.name} - {user.email}
          <button onClick={() => deleteUser(user._id)}>Delete</button>
        </div>
      ))}
    </AdminLayout>
  );
};

export default AdminUsers;
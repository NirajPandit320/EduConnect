import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useSelector } from "react-redux";

const Header = () => {
  const { user } = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <header className="main-header">
      <div className="logo">EduConnect</div>

      <div className="header-right">
        <span className="user-email">{user?.email}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;

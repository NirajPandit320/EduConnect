import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";

const Header = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logout successful");
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <header>
      <h1>EduConnect</h1>
      <button onClick={handleLogout}>logout</button>
    </header>
  );
};

export default Header;
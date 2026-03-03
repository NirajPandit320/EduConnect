import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useDispatch } from "react-redux";
import { clearUser } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
      navigate("/"); 
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header className="main-header">
      <div className="logo">EduConnect</div>
      <button onClick={handleLogout}>Logout</button>
    </header>
  );
};

export default Header;
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useDispatch } from "react-redux";
import { clearUser } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";
import { clearAdminSession } from "../../utils/adminHelper";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearAdminSession();
      dispatch(clearUser());
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header className="main-header">
      <div className="header-brand" aria-label="EduConnect">
        <img
          src="/EduconnectLogo.png"
          alt="EduConnect"
          className="header-brand-logo"
        />
        <span className="header-brand-text">EduConnect</span>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </header>
  );
};

export default Header;
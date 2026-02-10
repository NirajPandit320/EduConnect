import { useEffect } from "react";
import RootPage from "./pages/RootPage";
import AuthPage from "./pages/AuthPage";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { clearUser, setUser } from "./store/userSlice";
import { auth } from "./utils/firebase";

function App() {
  const { user } = useSelector((state) => state.user);
  
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user);
      if (user) {
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
        );
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    user ? <RootPage /> : <AuthPage />
  );
}

export default App;

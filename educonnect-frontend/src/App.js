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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser);

      if (firebaseUser) {
        try {
          // 🔥 Fetch full profile from backend using UID
          const response = await fetch(
            `http://localhost:5000/api/users/uid/${firebaseUser.uid}`
          );

          const data = await response.json();

          if (response.ok) {
            // ✅ Store MongoDB user profile in Redux
            dispatch(setUser(data.user));
          } else {
            console.error("User not found in backend");
            dispatch(clearUser());
          }

        } catch (error) {
          console.error("Profile fetch failed:", error);
          dispatch(clearUser());
        }

      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return user ? <RootPage /> : <AuthPage />;
}

export default App;

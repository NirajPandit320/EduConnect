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

      if (!firebaseUser) {
        dispatch(clearUser());
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/users/uid/${firebaseUser.uid}`
        );

        if (response.ok) {
          const data = await response.json();
          dispatch(setUser(data.user)); // full Mongo profile
        } else {
          // If backend profile not found, still login with Firebase data
          dispatch(
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            })
          );
        }
      } catch (error) {
        console.log("Backend fetch failed, using Firebase only");

        dispatch(
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          })
        );
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return user ? <RootPage /> : <AuthPage />;
}

export default App;
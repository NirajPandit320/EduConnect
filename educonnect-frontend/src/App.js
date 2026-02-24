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
    const response = await fetch(
      `http://localhost:5000/api/users/uid/${firebaseUser.uid}`
    );

    const data = await response.json();

    if (response.ok) {
      dispatch(setUser(data.user));
    } else {
      
      dispatch(setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
      }));
    }

  } catch (error) {
    dispatch(setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
    }));
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

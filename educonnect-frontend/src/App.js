import { useEffect } from "react";
import RootPage from "./pages/RootPage";
import AuthPage from "./pages/AuthPage";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { clearUser, setUser } from "./store/userSlice";
import { auth } from "./utils/firebase";
import { API_BASE_URL } from "./utils/apiConfig";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { isAdminLoggedIn } from "./utils/adminHelper";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminResources from "./pages/admin/AdminResources";
import AdminNotifications from "./pages/admin/AdminNotifications";

const ProtectedRoute = ({ user, children }) => {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
};

const AuthRoute = ({ user }) => {
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || "/dashboard";

  if (user) {
    return <Navigate to={redirectPath} replace />;
  }

  return <AuthPage />;
};

const ProtectedAdminRoute = ({ children }) => {
  const isAdmin = isAdminLoggedIn();

  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleBlockedUser = async () => {
    dispatch(clearUser());
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Signout after block check failed:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser);

      if (!firebaseUser) {
        dispatch(clearUser());
        return;
      }

      try {
        //  Step 1: Try to fetch user
        let response = await fetch(
          `${API_BASE_URL}/api/users/uid/${firebaseUser.uid}`
        );

        if (response.status === 403) {
          const blockedData = await response.json();
          console.warn(blockedData?.message || "Blocked user denied");
          await handleBlockedUser();
          return;
        }

        //  Step 2: If NOT found → create user
        if (!response.ok) {
          console.log("User not found → creating...");

          const createRes = await fetch(`${API_BASE_URL}/api/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              name:
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                "User",
              email: firebaseUser.email,
            }),
          });

          const createData = await createRes.json();
          console.log("Create user response:", createData);

          //  Step 3: Fetch again after creating
          response = await fetch(
            `${API_BASE_URL}/api/users/uid/${firebaseUser.uid}`
          );
        }

        //  Step 4: Final user fetch
        const data = await response.json();
        console.log("Final user data:", data);

        if (data?.user?.status === "blocked" || data?.user?.status === "inactive") {
          await handleBlockedUser();
          return;
        }

        dispatch(setUser(data?.user || {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        }));

      } catch (error) {
        console.error("Backend error:", error);

        if (String(error?.message || "").toLowerCase().includes("blocked")) {
          await handleBlockedUser();
          return;
        }

        //  Step 5: Fallback (still allow login)
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

  if (loading) {
    return null;
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute user={user} />} />
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/auth"} replace />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/posts"
        element={
          <ProtectedAdminRoute>
            <AdminPosts />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedAdminRoute>
            <AdminEvents />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedAdminRoute>
            <AdminUsers />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedAdminRoute>
            <AdminJobs />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/resources"
        element={
          <ProtectedAdminRoute>
            <AdminResources />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedAdminRoute>
            <AdminNotifications />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/:page"
        element={(
          <ProtectedRoute user={user}>
            <RootPage />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth"} replace />} />
    </Routes>
  );
}

export default App;

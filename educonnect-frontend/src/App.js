import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <Login switchToSignup={() => setIsLogin(false)} />
      ) : (
        <Signup switchToLogin={() => setIsLogin(true)} />
      )}
    </>
  );
}

export default App;

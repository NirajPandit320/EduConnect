import Header from "../components/navigation/Header";
import Footer from "../components/navigation/Footer";
import PostsList from "../components/posts/PostsList";


const RootPage = () => {
  return (
    <div className="root-layout">
      <Header />

      <main className="main-content">
        <h1 className="welcome-text">
          Welcome to <span>EduConnect</span>
        </h1>

        <PostsList />
      </main>

      <Footer />
    </div>
  );
};

export default RootPage;

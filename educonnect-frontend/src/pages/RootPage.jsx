import Header from "../components/navigation/Header";
import Footer from "../components/navigation/Footer";
import UsersList from "../components/users/UsersList";
const RootPage = () => {

  return (
    <div className="root-page">
      <Header />
      <section>
        <h1>Welcome to EduConnect: AUTHENTICATED</h1>
        {/* <PostsList /> */}
        <UsersList />
      </section>
      <Footer />
    </div>
  );
};

export default RootPage;   
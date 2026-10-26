import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './MainLayout.css';

// MainLayout: wraps every page with the navbar and footer.
// "children" = whatever page we put inside <MainLayout> ... </MainLayout>
function MainLayout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-main">{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;
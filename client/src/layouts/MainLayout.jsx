import Header from '../components/Header';
import Footer from '../components/Footer';
import './MainLayout.css';

// MainLayout: wraps every page with the header and footer.
// "children" = whatever page we put inside <MainLayout> ... </MainLayout>
function MainLayout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main className="layout-main">{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;
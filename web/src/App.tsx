import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Topbar } from './components/Topbar';
import { Contact } from './pages/Contact';
import { Cv } from './pages/Cv';
import { Home } from './pages/Home';
import { Reports } from './pages/Reports';
import { PlaygroundShell } from './playground/PlaygroundShell';
import { Checkout } from './playground/pages/Checkout';
import { Forms } from './playground/pages/Forms';
import { Login } from './playground/pages/Login';
import { PlaygroundHome } from './playground/pages/PlaygroundHome';
import { Shop } from './playground/pages/Shop';
import { Signup } from './playground/pages/Signup';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Topbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cv" element={<Cv />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/playground" element={<PlaygroundShell />}>
          <Route index element={<PlaygroundHome />} />
          <Route path="shop" element={<Shop />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="forms" element={<Forms />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

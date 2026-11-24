import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Topbar } from './components/Topbar';
import { Contact } from './pages/Contact';
import { Cv } from './pages/Cv';
import { Home } from './pages/Home';
import { Reports } from './pages/Reports';

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
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

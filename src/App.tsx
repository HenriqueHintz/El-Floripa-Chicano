import { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { MenuSection } from './components/MenuSection';
import { Respiro } from './components/Respiro';
import { Gallery } from './components/Gallery';
import { Units } from './components/Units';
import { Franchise } from './components/Franchise';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { Preloader } from './components/Preloader';
import { smoothScrollToTarget } from './utils/scroll';

const FranchisePage = lazy(() =>
  import('./components/FranchisePage').then((m) => ({ default: m.FranchisePage }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#001219] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#EE9B00]/30 border-t-[#EE9B00] rounded-full animate-spin" />
        <span className="text-sm font-sans tracking-widest uppercase text-[#94D2BD]/80">
          Carregando...
        </span>
      </div>
    </div>
  );
}

type Route = 'home' | 'franchise' | 'admin';

function getInitialRoute(): Route {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path.includes('/franquia') || hash === '#franquia') return 'franchise';
  if (path.includes('/admin') || hash === '#admin') return 'admin';
  return 'home';
}

export function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>(getInitialRoute);
  const [showPreloader, setShowPreloader] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    // Show preloader only on initial visit per session
    const hasLoaded = sessionStorage.getItem('el_chicano_preloaded');
    return !hasLoaded;
  });

  const navigateTo = (route: Route, pushHistory = true) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pushHistory && typeof window !== 'undefined') {
      const targetPath = route === 'home' ? '/' : `/${route}`;
      window.history.pushState({ route }, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (href: string) => {
    if (href === '/admin' || href === '#admin') {
      navigateTo('admin');
      return;
    }
    if (href === '/franquia' || href === '#franquia') {
      navigateTo('franchise');
      return;
    }
    if (href.startsWith('#')) {
      if (currentRoute !== 'home') {
        navigateTo('home');
        setTimeout(() => smoothScrollToTarget(href), 100);
      } else {
        smoothScrollToTarget(href);
      }
    }
  };

  const handlePreloaderFinish = () => {
    setShowPreloader(false);
    sessionStorage.setItem('el_chicano_preloaded', 'true');
  };

  // Route 1: Dedicated High-Conversion Franchise Landing Page
  if (currentRoute === 'franchise') {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <FranchisePage onBackToHome={() => navigateTo('home')} />
      </Suspense>
    );
  }

  // Route 2: Admin Dashboard (Leads Management & Instagram Slots)
  if (currentRoute === 'admin') {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <AdminDashboard onBackToHome={() => navigateTo('home')} />
      </Suspense>
    );
  }

  // Route 3: Main Restaurant Landing Page
  return (
    <div className="relative min-h-screen bg-[#001219] text-[#E9D8A6] selection:bg-[#EE9B00] selection:text-[#001219] overflow-x-clip">
      {/* Atmospheric Preloader */}
      {showPreloader && <Preloader onFinish={handlePreloaderFinish} />}

      {/* Main Floating Navigation Header */}
      <Header onNavigate={handleNavigate} />

      {/* Main Semantic Content Landmark */}
      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero Section */}
        <Hero onNavigate={handleNavigate} />

        {/* About Section (Nossa História & Video Player) */}
        <About />

        {/* Menu & Products Section */}
        <MenuSection />

        {/* Respiro Callout Section */}
        <Respiro onNavigate={handleNavigate} />

        {/* Gallery & Lightbox Section */}
        <Gallery />

        {/* Nossas Casas / Units Section */}
        <Units />

        {/* Franchise Section (With Quero Começar CTA) */}
        <Franchise onNavigateToFranchise={() => navigateTo('franchise')} />

        {/* Contact Section */}
        <Contact />
      </main>

      {/* Complete Footer with subtle Admin access */}
      <Footer onNavigate={handleNavigate} />

      {/* Fixed Side Actions (WhatsApp, Cardápio, Top) */}
      <FloatingActions />
    </div>
  );
}

export default App;

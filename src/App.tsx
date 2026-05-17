import { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { AccessScreen } from './components/AccessScreen';
import { AuthScreen } from './components/AuthScreen';
import { Home } from './pages/Home';

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
};

function App() {
  const { authMode, isAuthenticated, initAppwrite, settings } = useAppStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initAppwrite();
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (settings?.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', hexToRgb(settings.primaryColor));
    }
  }, [settings?.primaryColor]);

  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else if (settings.theme === 'auto') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings?.theme]);

  if (showSplash) {
    return (
      <div className="splash-overlay">
        <svg viewBox="0 0 400 100" className="splash-svg">
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="draw-text">
            Artxus
          </text>
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authMode === 'access') {
      return <AccessScreen />;
    }
    return <AuthScreen />;
  }

  return <Home />;
}

export default App;

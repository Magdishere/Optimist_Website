import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../theme/ThemeContext';

const MainLayout = () => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      <Header />
      <main className="flex-grow container mx-auto px-3 md:px-6 py-4 md:py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

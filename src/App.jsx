import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom';
import Bar from './components/bar'
import Header from './components/header'

const App = () => {
  const location = useLocation();
  const hideBarRoutes = ['/detail', '/categories'];
  const shouldHideBar = hideBarRoutes.some(path => location.pathname.startsWith(path));
  const tg = window.Telegram.WebApp;
  useEffect(() => {
    tg.ready(); // WebApp ishga tayyor
    tg.expand(); // butun ekran qilib ochadi

    console.log("Telegram WebApp foydalanuvchi:", tg.initDataUnsafe?.user);
  }, []);
  return (
    <div className="min-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header />
      <main className="pb-16">
        <Outlet />
        <h1 className="text-2xl font-bold">Telegram Do‘kon {tg.initDataUnsafe?.user}</h1>
      </main>
      {!shouldHideBar && <Bar />}
    </div>
  )
}

export default App;

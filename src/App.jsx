import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Bar from "./components/bar";
import Header from "./components/header";
import axios from "axios";

const App = () => {
  const location = useLocation();
  const hideBarRoutes = ["/detail", "/categories"];
  const shouldHideBar = hideBarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );
  const API_URL = import.meta.env.VITE_API_URL; // ✅ env-dan olyapti
  useEffect(() => {
    const tgInitData = window.Telegram?.WebApp?.initData; // signed string
    // const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;


    if (tgInitData) {
      axios.post(`${API_URL}/api/telegram/check`, { initData: tgInitData })
        .then(res => {
          console.log(res.data);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, []);


  return (
    <div className="min-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header />
      <main className="">
        <Outlet />

      </main>
      {!shouldHideBar && <Bar />}
    </div>
  );
};


export default App;

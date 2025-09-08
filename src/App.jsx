import React, { useEffect, useState } from "react";
// import { Outlet, useLocation } from "react-router-dom";
import Bar from "./components/bar";
import Header from "./components/header";
import axios from "axios";

const App = () => {


  useEffect(() => {
    const tgInitData = window.Telegram?.WebApp?.initData; // signed string
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;


    if (tgInitData) {
      axios.post("https://756a4adcb607.ngrok-free.app/api/telegram/check", { initData: tgInitData })
        .then(res => {
          alert(res.data);
        })
        .catch(err => {
          alert("Error: " + err.message);
        });
    }
  }, []);
  return (
    <div className="min-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header />
      <main className="pb-16">
        <Outlet />

      </main>
      {!shouldHideBar && <Bar />}
    </div>
  );
};

export default App;

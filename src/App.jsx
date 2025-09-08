import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Bar from "./components/bar";
import Header from "./components/header";
import axios from "axios";

const App = () => {
  //   const location = useLocation();
  //   const hideBarRoutes = ["/detail", "/categories"];
  //   const shouldHideBar = hideBarRoutes.some((path) =>
  //     location.pathname.startsWith(path)
  //   );


  //   return (
  //     <div className="min-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
  //       <Header />
  //       <main className="pb-16">
  //         <Outlet />

  //       </main>
  //       {!shouldHideBar && <Bar />}
  //     </div>
  //   );
  // };

  const [user, setUser] = useState(null);

  useEffect(() => {
    const initData = window.Telegram?.WebApp?.initData;
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      setUser(tgUser);
      axios.post("https://490e316e106e.ngrok-free.app/api/telegram/check-telegram", { initData })
        .then(res => {
          if (res.data.ok) setUser(res.data.user);
          else console.log('Verification failed', res.data.error);
        })
        .catch(err => console.log(err));
    }
  }, []);

  return (
    <div>
      {user ? (
        <p>Salom, {user.first_name} (ID: {user.id})</p>
      ) : (
        <p>Telegram user topilmadi</p>
      )}
    </div>
  );
};

export default App;

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
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      setUser(tgUser);

      // backendga yuborish
      axios.post("https://telegram-web-app-backend.laravel.cloud/api/telegram/save-user", {
        telegram_id: tgUser.id,
        username: tgUser.username,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
      });
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

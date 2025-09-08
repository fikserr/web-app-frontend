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
  const [initData, setInitData] = useState("");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg?.initData) {
      setInitData(tg.initData); // raw initData
      setUser(tg.initDataUnsafe?.user || null);

      // backendga yuborish
      axios
        .post("https://490e316e106e.ngrok-free.app/api/telegram/check", { initData: tg.initData })
        .then((res) => {
          console.log("✅ Verified:", res.data);
        })
        .catch((err) => {
          console.error("❌ Error:", err);
        });
    } else {
      setInitData("❌ Telegram initData topilmadi");
    }
  }, []);

  return (
    <div>
      <h2>Telegram User</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <h3>InitData</h3>
      <pre>{initData}</pre>
    </div>
  );
};

export default App;

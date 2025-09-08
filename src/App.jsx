import React, { useEffect, useState } from "react";
// import { Outlet, useLocation } from "react-router-dom";
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
  const [setInitData, setInitDataSet] = useState('');
  const [responseData, setResponseData] = useState(null); // backend javobini saqlash uchun

  useEffect(() => {
    const initData = window.Telegram?.WebApp?.initData; // signed string
     const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      setUser(tgUser);
      setInitDataSet(`${initData}`);
    if (initData) {
      axios.post("https://490e316e106e.ngrok-free.app/api/telegram/check", {initData: setInitData })
        .then(res => {
          setResponseData(res.data);       // backend javobini saqlaymiz
        })
        .catch(err => {
          setResponseData({ ok: false, error: err.message });
        });
    }
  }, []);

  return (
    <div className="p-4">
      <h1>Telegram WebApp User</h1>

      {user ? (
        <div>
          <p>Salom, {user.first_name} (ID: {user.id}) initData {setInitData}</p>
        </div>
      ) : (
        <p>Telegram user topilmadi</p>
      )}

      <hr />

      <h2>Backend Response:</h2>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {JSON.stringify(responseData, null, 2)}
      </pre>
    </div>
  );
};

export default App;

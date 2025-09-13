import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react"; // ikonalar
import Logo from '../../assets/prosys.png'

const Header = () => {
    // const [theme, setTheme] = useState(
    //     localStorage.getItem("theme") || "light"
    // );

    // useEffect(() => {
    //     if (theme === "dark") {
    //         document.documentElement.classList.add("dark");
    //     } else {
    //         document.documentElement.classList.remove("dark");
    //     }
    //     localStorage.setItem("theme", theme);
    // }, [theme]);
    const tg = window.Telegram.WebApp;

    // light yoki dark qaytadi
    console.log("Theme:", tg.colorScheme);

    if (tg.colorScheme === "dark") {
        document.documentElement.classList.add("dark"); // masalan Tailwind uchun
    } else {
        document.documentElement.classList.remove("dark");
    }


    return (
        <div className="px-5 xl:px-10 h-16 py-1 dark:bg-gray-800 text-gray-900 bg-white dark:text-gray-100 shadow-md fixed w-full top-0 z-50 ">
            <div className="my-3 flex items-center justify-between">
                {/* Logo */}
                <img src={Logo} alt="Logo" className="h-10 dark:shadow-md dark:shadow-white " />

                {/* Toggle button */}
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:opacity-80 transition"
                >
                    {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </div>
    );
};

export default Header;

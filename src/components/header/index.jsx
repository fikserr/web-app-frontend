import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react"; 
import Logo from '../../assets/Logo.png' 

const Header = () => {
    const tg = window.Telegram.WebApp;
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || tg.colorScheme || "light"
    );

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    // agar foydalanuvchi Telegramda theme o'zgartirsa shu event ishlaydi
    useEffect(() => {
        const handleThemeChange = () => {
            setTheme(tg.colorScheme);
        };

        tg.onEvent("themeChanged", handleThemeChange);

        return () => {
            tg.offEvent("themeChanged", handleThemeChange);
        };
    }, [tg]);

    return (
        <div className="px-5 xl:px-10 h-16 py-1 dark:bg-gray-800 text-gray-900 bg-white dark:text-gray-100 shadow-md fixed w-full top-0 z-50 ">
            <div className="my-3 flex items-center justify-between">
                {/* Logo */}
                <img src={Logo} alt="Logo" className="h-10 dark:shadow-md" />

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

import React from 'react'
import { IoHome, IoFileTrayFull } from "react-icons/io5";
import { Link, useLocation } from 'react-router-dom';
import { IoIosCart } from "react-icons/io";
import { GiShop } from "react-icons/gi";

const Bar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const linkClass = (path) =>
        `flex flex-col items-center ${currentPath === path ? 'text-emerald-600 font-semibold' : 'text-gray-700'}`;
    return (
        <div className='fixed bottom-0 left-0 right-0 z-50 w-full border-t-2 border-slate-300 bg-white'>
            <div className='flex items-center justify-evenly my-3'>
                <Link to={'/'} className={linkClass('/')}>
                    <IoHome style={{fontSize: "25px" }} />
                    <span>Asosiy</span>
                </Link>
                <Link to={'/shop'} className={linkClass('/shop')}>
                    <GiShop style={{fontSize: "25px" }} />
                    <span>Do'kon</span>
                </Link>
                <Link to={'/basket'} className={linkClass('/basket')}>
                    <IoIosCart style={{fontSize: "25px" }} />
                    <span>Savat</span>
                </Link>
                <Link to={'/report'} className={linkClass('/report')}>
                    <IoFileTrayFull style={{fontSize: "25px" }} />
                    <span>Hisobot</span>
                </Link>
            </div>
        </div>
    )
}

export default Bar

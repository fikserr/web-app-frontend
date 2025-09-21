import React from "react";
import iphone from "../assets/reportImg.png";
import useBalance from "../hooks/useBalance";

const Report = () => {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const { balance, loading, error } = useBalance(tgUser?.id);

  if (loading) return <div>Yuklanmoqda...</div>;
  if (error) return <div>Xatolik: {error.message}</div>;
  console.log(balance);

  return (
    <div className="px-2 xl:px-10 py-24">
      <h1 className="font-bold text-4xl">Hisobot</h1>
      <p className="text-slate-500 my-3">
        {" "}
        {balance.split("\n").map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </p>
      <div className="bg-slate-100 p-3 rounded-lg max-w-sm my-10">
        <div className="bg-slate-300 p-2 rounded-lg flex items-center gap-5 my-5">
          <img src={iphone} alt="sdfg" className="w-10" />
          <p className="font-semibold text-lg dark:text-black">
            iPhone 14 Pro Max
          </p>
        </div>
        <div className="border-b-2 grid grid-cols-2">
          <div>
            <p className="text-slate-500">Narxi</p>
            <p className="font-bold text-lg dark:text-black">7 860 000 UZS</p>
          </div>
          <div>
            <p className="text-slate-500">Miqdor</p>
            <p className="font-bold text-lg dark:text-black">1 dona</p>
          </div>
        </div>
        <div className="border-b-2 grid grid-cols-2">
          <div>
            <p className="text-slate-500">To'langan</p>
            <p className="font-bold text-lg text-green-700">6 000 000 UZS</p>
          </div>
          <div>
            <p className="text-slate-500">Qarzdorlik</p>
            <p className="font-bold text-lg text-red-500">1 860 000 UZS</p>
          </div>
        </div>
        <div className="border-b-2 grid grid-cols-2">
          <div>
            <p className="text-slate-500">Sana</p>
            <p className="font-bold text-lg dark:text-black">03.06.2025</p>
          </div>
          <div>
            <p className="text-slate-500">Izoh</p>
            <p className="font-bold text-lg text-red-500">-</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;

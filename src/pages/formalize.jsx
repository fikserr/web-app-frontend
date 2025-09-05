import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import { FaRegCircleCheck } from "react-icons/fa6";
import PayMe from '../assets/payme.png';
import Click from '../assets/clickUp.png';

const paymentOptions = [
    {
        id: "card",
        label: "Karta bilan (Uzcard, Humo)",
        icon: <FaCreditCard />,
    },
    {
        id: "payme",
        label: "Payme",
        icon: <img src={PayMe} alt="Payme" className="w-6 h-6" />,
    },
    {
        id: "click",
        label: "Click",
        icon: <img src={Click} alt="Click" className="w-6 h-6" />,
    },
    {
        id: "cash",
        label: "Naqd pul orqali",
        icon: <FaMoneyBillWave />,
    },
];

const Checkout = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState("card");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");

    return (
        <div>
            <div className="max-w-md mx-auto p-4 bg-white min-h-screen mt-24 dark:bg-gray-900">
                <h1 className="text-2xl font-bold mb-4">Rasmiylashtirish</h1>

                <h2 className="text-sm font-semibold mb-2">To‘lov turini tanlang</h2>
                <div className="space-y-3 mb-6 dark:text-black">
                    {paymentOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setSelectedPayment(option.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border ${selectedPayment === option.id
                                ? "bg-green-100 border-green-600"
                                : "bg-gray-100 border-transparent"
                                }`}
                        >
                            <span className="text-xl">{option.icon}</span>
                            <span className="text-sm font-medium">{option.label}</span>
                            <span className="ml-auto">
                                {selectedPayment === option.id && (
                                    <span className="w-4 h-4 rounded-full bg-green-600 inline-block" />
                                )}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">
                        Manzilingizni kiriting
                    </label>
                    <input
                        type="text"
                        className="w-full p-3 rounded-md border border-gray-300 dark:text-black outline-none"
                        placeholder="Manzil..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        className="w-full p-3 rounded-md border border-gray-200 text-gray-600 outline-none"
                        placeholder="Qo‘shimcha izoh"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

            </div>
            <button onClick={() => setShowModal(true)} className='bg-[rgb(22,113,98)] w-full py-2 text-white rounded-md fixed bottom-20 right-0 left-0'>
                Buyurtma berish
            </button>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center relative">
                        <FaRegCircleCheck className='flex justify-center w-full text-4xl text-green-600' />
                        <h3 className="text-lg font-semibold my-5 mb-14 dark:text-black">Buyurtmangizni tasdiqlandi</h3>
                        <div className="flex justify-around mt-4">
                            <Link
                                to="/"
                                className="w-full absolute bottom-0 right-0 py-2 border-t-2 dark:text-black"
                                onClick={() => {
                                    setShowModal(false);
                                }}
                            >
                                Bosh sahifaga qaytish
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;

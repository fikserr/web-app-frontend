import React, { useEffect, useState } from 'react';
import { BsBagHeart } from "react-icons/bs";
import { PiWarningCircle } from "react-icons/pi";
import { Link } from 'react-router-dom';

const Basket = () => {
  const [showModal, setShowModal] = useState(false);
  const [basketItems, setBasketItems] = useState([]);

  useEffect(() => {
    const storedItems = sessionStorage.getItem("basketCounts");

    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        const itemsArray = Array.isArray(parsedItems) ? parsedItems : Object.values(parsedItems);
        setBasketItems(itemsArray);
      } catch (err) {
        console.error("JSON parse error:", err);
        setBasketItems([]);
      }
    }
  }, []);
  const handleIncrement = (index) => {
    const updatedItems = [...basketItems];
    updatedItems[index].count += 1;
    setBasketItems(updatedItems);
    sessionStorage.setItem("basketCounts", JSON.stringify(updatedItems));
  };

  const handleDecrement = (index) => {
    const updatedItems = [...basketItems];

    if (updatedItems[index].count > 1) {
      updatedItems[index].count -= 1;
    } else {
      updatedItems.splice(index, 1);
    }

    setBasketItems(updatedItems);
    sessionStorage.setItem("basketCounts", JSON.stringify(updatedItems));
  };

  return (
    <div className='px-3 xl:px-10 mt-24'>
      <h2 className='text-3xl font-bold'>Savat</h2>

      {basketItems.length === 0 ? (
        <div>
          <div className='max-w-xl mx-auto py-20 bg-gray-300 dark:bg-transparent rounded-lg flex flex-col items-center mt-5 md:hidden'>
            <BsBagHeart className='text-5xl text-[rgb(22,113,98)] mb-3' />
            <p className='text-lg text-gray-600'>Sizning savatingiz bo'sh.</p>
          </div>
          <div className='hidden max-w-xl mx-auto py-44 rounded-lg md:flex flex-col items-center justify-center mt-5'>
            <BsBagHeart className='text-5xl text-[rgb(22,113,98)] mb-3' />
            <p className='text-lg text-gray-600'>Sizning savatingiz bo'sh.</p>
          </div>
        </div>
      ) : (
        <div className='mt-5 space-y-4 grid md:grid-cols-2 items-center md:space-y-0 gap-3 lg:grid-cols-3 xl:grid-cols-4'>
          {basketItems.map((item, index) => (
            <div
              key={item.id || index}
              className="flex max-w-md items-center gap-4 bg-white rounded-xl shadow-md p-2 border"
            >
              <div className="rounded-xl">
                <img src={item.image} alt={item.title} className="object-contain w-24 h-24" />
              </div>
              <div className='w-2/3'>
                <div className='w-full'>
                  <p className="text-lg font-bold dark:text-black">{item.title}</p>
                  <p className="text-gray-500 text-sm">Rangi: Gray</p>
                </div>
                <div className='flex items-end justify-between'>
                  <div>
                    <p className="text-xl font-bold mt-1 dark:text-black">
                      ${(item.price * item.count).toLocaleString()}
                    </p>
                    <p className="text-gray-500 mt-1 text-sm">Miqdori: {item.count}</p>
                  </div>
                  <div className="flex items-center bg-slate-100 rounded-lg px-2">
                    <button
                      className="text-xl px-2 dark:text-black"
                      onClick={() => handleDecrement(index)}
                    >
                      −
                    </button>
                    <button
                      className="text-xl px-2 dark:text-black"
                      onClick={() => handleIncrement(index)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {basketItems.length > 0 && (
        <button onClick={() => setShowModal(true)} className='bg-[rgb(22,113,98)] w-full py-2 text-white rounded-md fixed bottom-20 right-0 left-0'>
          Buyurtma berish
        </button>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center relative">
            <PiWarningCircle className='flex justify-center w-full text-4xl text-orange-400' />
            <h3 className="text-lg font-semibold my-5 mb-14 dark:text-black">Buyurtmangizni tasdiqlaysizmi?</h3>
            <div className="flex justify-around mt-4">
              <button
                className="w-1/2 absolute bottom-0 left-0 py-2 border-r-2 border-t-2 dark:text-black"
                onClick={() => setShowModal(false)}
              >
                Yo'q
              </button>
              <Link
                to="/formalize"
                className="w-1/2 absolute bottom-0 right-0 py-2 border-t-2 dark:text-black"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                Ha
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Basket;

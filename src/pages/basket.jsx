import React, { useState } from 'react';
import { BsBagHeart } from "react-icons/bs";
import { PiWarningCircle } from "react-icons/pi";
import useBasket from '../hooks/useBasket';
import useOrder from '../hooks/useOrder';

const Basket = () => {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const [showModal, setShowModal] = useState(false);
  const { basket, loading, error } = useBasket(String(tgUser?.id)); // Foydalanuvchi ID sini stringga aylantirish

  // ✅ order hook
  const { createOrder, loading: orderLoading, error: orderError } = useOrder();

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <p>Xatolik: {error}</p>;

  const handleConfirmOrder = async () => {
    const orderData = {
      userId: String(tgUser?.id),
      UUID: crypto.randomUUID(),
      date: new Date().toISOString(),
      comment: "ixtiyoriy",
      basket: basket.map(item => ({
        productId: item.product_id,
        measureId: item.measure_id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const res = await createOrder(orderData);
      console.log("✅ Buyurtma yuborildi:", res);
      alert("Buyurtmangiz qabul qilindi!");
      setShowModal(false);
    } catch (err) {
      console.error("❌ Buyurtma xatolik:", err);
      alert("Buyurtma yuborishda xatolik yuz berdi!");
    }
  };

  return (
    <div className='px-3 xl:px-10 mt-24'>
      <h2 className='text-3xl font-bold'>Savat</h2>

      {basket.length === 0 ? (
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
        <div className='mt-5 space-y-0 grid md:grid-cols-2 items-center md:space-y-0 gap-3 lg:grid-cols-3 xl:grid-cols-4'>
          {basket.map((item, index) => (
            <div
              key={item.id || index}
              className="flex max-w-md items-center gap-4 bg-white rounded-xl shadow-md px-2 py-2 border"
            >
              <div className="rounded-xl h-full w-24">
                <img src={item.image} alt={item.name} className=" w-full h-full" />
              </div>
              <div className='w-2/3'>
                <div className='w-full'>
                  <p className="text-sm font-bold dark:text-black">{item.name}</p>
                </div>
                <div className='flex items-end justify-between'>
                  <div className='w-full'>
                    <p className="text-sm font-bold mt-1 dark:text-black">
                      ${item.price}
                    </p>
                    <div className='flex justify-between w-full'>
                      <p className="text-gray-500 mt-1 text-sm">Miqdori: {item.quantity}</p>
                      <p className="text-gray-500 mt-1 text-sm">Summa: {item.quantity * item.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {basket.length > 0 && (
        <button
          onClick={() => setShowModal(true)}
          className='bg-[rgb(22,113,98)] w-80 py-2 text-white mx-auto rounded-md fixed bottom-20 right-0 left-0'
        >
          Buyurtma berish
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center relative">
            <PiWarningCircle className='flex justify-center w-full text-4xl text-orange-400' />
            <h3 className="text-lg font-semibold my-5 mb-14 dark:text-black">
              Buyurtmangizni tasdiqlaysizmi?
            </h3>
            <div className="flex justify-around mt-4">
              <button
                className="w-1/2 absolute bottom-0 left-0 py-2 border-r-2 border-t-2 dark:text-black"
                onClick={() => setShowModal(false)}
              >
                Yo'q
              </button>
              <button
                className="w-1/2 absolute bottom-0 right-0 py-2 border-t-2 dark:text-black"
                onClick={handleConfirmOrder}
                disabled={orderLoading}
              >
                {orderLoading ? "Yuborilmoqda..." : "Ha"}
              </button>
            </div>
          </div>
        </div>
      )}

      {orderError && (
        <p className="text-red-500 text-center mt-4">
          ❌ Buyurtma xatolik: {String(orderError)}
        </p>
      )}
    </div>
  );
};

export default Basket;

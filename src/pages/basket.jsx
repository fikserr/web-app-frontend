import React, { useState } from "react";
import { BsBagHeart } from "react-icons/bs";
import { PiWarningCircle } from "react-icons/pi";
import useBasket from "../hooks/useBasket";
import useOrder from "../hooks/useOrder";
import useAddBasket from "../hooks/useAddBasket";
import { Link } from "react-router-dom";

const Basket = () => {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const [showModal, setShowModal] = useState(false);
  const tzOffset = 5 * 60; // UTC+5 → 5 soat
  const localDate = new Date(Date.now() + tzOffset * 60 * 1000);
  const { basket, clearBasket } = useBasket(); // ✅ endi userId kerak emas
  const { counts, updateQuantity } = useAddBasket();
  const formatted = localDate.toISOString().slice(0, 19);
  // ✅ order hook
  const { createOrder, loading: orderLoading, error: orderError } = useOrder();

  const handleConfirmOrder = async () => {
    if (!basket.length) return;

    const orderData = {
      userId: String(tgUser?.id), // Telegram user ID yoki "unknown"
      UUID: crypto.randomUUID(),
      date: formatted,
      comment: "ixtiyoriy",
      basket: basket.map((item) => ({
        productId: item.Id,
        measureId: item.measures?.[0]?.Id,
        quantity: counts[item.Id]?.count || 0, // ✅ miqdor counts'dan olinadi
        price: item.price,
      })),
    };

    try {
      const res = await createOrder(orderData);
      console.log("✅ Buyurtma yuborildi:", res);
      clearBasket(); // ✅ savatni tozalash
      alert("Buyurtmangiz qabul qilindi!");
      setShowModal(false);
      localStorage.removeItem("basket"); // ✅ savatni tozalash
    } catch (err) {
      console.error("❌ Buyurtma xatolik:", err);
      alert("Buyurtma yuborishda xatolik yuz berdi!");
    }
  };

  return (
    <div className="px-3 xl:px-10 py-24">
      <div className="flex items-end justify-between ">
        <h2 className="text-3xl font-bold">Savat</h2>
        <Link
          to={"/orderList"}
          className="text-base font-bold bg-[rgb(22,113,98)] text-white px-2 py-1 rounded"
        >
          Buyurtmalarim
        </Link>
      </div>

      {basket.length === 0 ? (
        <div>
          <div className="max-w-xl mx-auto py-20 bg-gray-300 dark:bg-transparent rounded-lg flex flex-col items-center mt-5 md:hidden">
            <BsBagHeart className="text-5xl text-[rgb(22,113,98)] mb-3" />
            <p className="text-lg text-gray-600">Sizning savatingiz bo'sh.</p>
          </div>
          <div className="hidden max-w-xl mx-auto py-44 rounded-lg md:flex flex-col items-center justify-center mt-5">
            <BsBagHeart className="text-5xl text-[rgb(22,113,98)] mb-3" />
            <p className="text-lg text-gray-600">Sizning savatingiz bo'sh.</p>
          </div>
        </div>
      ) : (
        <div className="mt-5 mb-10 space-y-0 grid md:grid-cols-2 items-center md:space-y-0 gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {basket.map((item) => {
            return (
              <div
                key={item.productId}
                className="flex max-w-md items-center gap-4 bg-white rounded-xl shadow-md px-2 py-2 border"
              >
                <div className="rounded-xl h-full w-24">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full"
                  />
                </div>
                <div className="w-2/3">
                  <p className="text-sm font-bold dark:text-black">
                    {item.name}
                  </p>
                  <div className="flex items-end justify-between">
                    <div className="w-full">
                      <div className="flex items-center justify-between w-full">
                        <p className="text-sm font-bold mt-1 dark:text-black">
                          ${item.price}
                        </p>
                        <div className="flex justify-between items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item,
                                (counts[item.productId]?.count || 0) - 1
                              )
                            }
                            className="px-2 bg-[rgb(22,113,98)] rounded text-base text-white"
                          >
                            −
                          </button>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item,
                                (counts[item.productId]?.count || 0) + 1
                              )
                            }
                            className="px-2 bg-[rgb(22,113,98)] rounded text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between w-full">
                        <p className="text-gray-500 mt-1 text-sm">
                          Miqdori: {counts[item.productId]?.count || 0}
                        </p>
                        <p className="text-gray-500 mt-1 text-sm">
                          Summa:{" "}
                          {(counts[item.productId]?.count || 0) * item.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {basket.length > 0 && (
        <button
          onClick={() => setShowModal(true)}
          className="bg-[rgb(22,113,98)] w-80 py-2 text-white mx-auto rounded-md fixed bottom-20 right-0 left-0"
        >
          Buyurtma berish
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center relative">
            <PiWarningCircle className="flex justify-center w-full text-4xl text-orange-400" />
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

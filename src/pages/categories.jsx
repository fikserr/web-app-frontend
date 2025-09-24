import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useCategories from "../hooks/useCategories";

const Categories = () => {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const {
    categories,
    meta,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories(tgUser?.id, 1, 10);
  const [cat, setCat] = useState([]); // faqat bitta state

  // Kategoriyalar kelganda active qo‘shamiz
  useEffect(() => {
    if (categories && categories.length > 0) {
      setCat(
        categories.map((c, index) => ({
          ...c,
          active: index === 0, // birinchi kategoriya aktiv bo‘ladi
        }))
      );
    }
  }, [categories]);

  const handleCategoryClick = (index) => {
    setCat((prev) =>
      prev.map((c, i) => ({
        ...c,
        active: i === index,
      }))
    );
  };

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <p>Xato: {error}</p>;
  console.log(categories);

  return (
    <div className="px-2 mb-40 mt-24">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((c, index) => (
          <div
            key={index}
            onClick={() => handleCategoryClick(index)}
            className={`cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
              c.active
                ? "text-[rgb(22,113,98)]"
                : "text-gray-800 dark:text-white"
            }`}
          >
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 shadow-md overflow-hidden ${
                c.active ? "bg-[rgb(22,113,98)]" : "bg-gray-100"
              }`}
            >
              <img
                src={c.imageUrl || "/src/assets/no-photo.jpg"}
                alt={c.title}
                className="w-25 h-25 object-contain"
              />
            </div>
            <p className="text-sm font-medium">
              {c.name.length > 20 ? c.name.slice(0, 20) + "..." : c.name}
            </p>
          </div>
        ))}
      </div>
      <Link
        to={"/shop"}
        className="bg-[rgb(22,113,98)] w-full text-center py-2 text-white rounded-md fixed bottom-0 right-0 left-0"
      >
        Tanlash
      </Link>
    </div>
  );
};

export default Categories;

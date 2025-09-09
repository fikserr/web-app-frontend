import React, { useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { Link } from "react-router-dom";
import useCategories from "../hooks/useCategories";
import CategorySwiper from "../components/swiperCategories";
import useProducts from "../hooks/useProducts";
import Card from "../components/card";

const Shop = () => {
//  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts(selectedCategory, 1, 4);

  console.log(selectedCategory);
  // Kategoriya tanlash
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  // Basketga qo'shish

  console.log(products);

  return (
    <div className="px-2 mb-16 xl:px-10 mt-24">
      {/* Search Input */}
      <div className="flex items-center md:max-w-lg border justify-between p-2 rounded-xl px-5 mb-6">
        <input
          type="text"
          placeholder="Qidiruv..."
          className="text-lg w-full outline-none px-3 bg-transparent text-gray-800 placeholder-gray-500 focus:border-[rgb(22,113,98)] focus:ring-0 focus:outline-none dark:text-white"
        />
        <IoMdSearch className="text-2xl" />
      </div>

      {/* Kategoriyalar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Kategoriyalar</h2>
          <Link
            to={"/categories"}
            className="text-sm text-blue-600 hover:underline"
          >
            Barchasini ko‘rish
          </Link>
        </div>

        {categoriesLoading && <p>Yuklanmoqda...</p>}
        {categoriesError && <p>Xato: {categoriesError}</p>}
        {categories && (
          <CategorySwiper
            categories={categories}
            handleCategoryClick={handleCategoryClick}
          />
        )}

        {/* Mahsulotlar */}
        <div className="my-5">
          <h2 className="font-bold text-2xl my-5">Mahsulotlar</h2>

          {productsLoading && <p>Yuklanmoqda...</p>}
          {productsError && <p>Xato: {productsError}</p>}
          {!productsLoading && products.length === 0 && (
            <p>Mahsulot topilmadi</p>
          )}
          {/* <p>{tgUser.id}</p> */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {products?.data?.map((product) => {
              
              return <Card key={product.Id} product={product}  userId={339299758}/>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;

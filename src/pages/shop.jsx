import React, { useMemo, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { Link } from "react-router-dom";
import useCategories from "../hooks/useCategories";
import CategorySwiper from "../components/swiperCategories";
import useProducts from "../hooks/useProducts";
import Card from "../components/card";
import useAddBasket from "../hooks/useAddBasket";

const Shop = () => {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const {
    categories,
    meta,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories(tgUser?.id, 1, 10);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts({
    page: 1,
    pageSize: 4,
    userId: tgUser?.id,
    categoryId: selectedCategory,
  });

  const { counts, updateQuantity } = useAddBasket(tgUser?.id);
  
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    console.log("Products:", products);

    if (!searchTerm.trim()) return products;

    return products.filter((p) => {
      const name =
        p?.Name || p?.name || p?.Title || p?.ProductName || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [products, searchTerm]);

  return (
    <div className="py-24 px-2 mb-16 xl:px-10">
      <div className="flex items-center md:max-w-lg border justify-between p-2 rounded-xl px-5 mb-6">
        <input
          type="text"
          placeholder="Qidiruv..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-lg w-full outline-none px-3 bg-transparent text-gray-800 placeholder-gray-500 focus:border-[rgb(22,113,98)] focus:ring-0 focus:outline-none dark:text-white"
        />
        <IoMdSearch className="text-2xl" />
      </div>

      
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
        {categoriesError && <p>Xato: {categoriesError}</p>}
        {categories && (
          <CategorySwiper
            categories={categories}
            handleCategoryClick={handleCategoryClick}
            loading={categoriesLoading}
          />
        )}

        <div className="my-5">
          <h2 className="font-bold text-2xl my-5">Mahsulotlar</h2>

          {productsError && <p>Xato: {productsError}</p>}
          {!productsLoading && products.length === 0 && (
            <div className="flex justify-center w-full my-20">
              <p className="text-center font-semibold text-base w-60">
                Mahsulotni Ko'rish uchun Kategoriyani Tanlang !
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {productsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} loading={true} />
              ))
              : filteredProducts.map((p) => (
                <Card
                  key={p.Id}
                  product={p}
                  productInCart={counts[p.Id]}
                  onUpdate={updateQuantity}
                  loading={false}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;

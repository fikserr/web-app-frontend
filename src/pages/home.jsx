import React from 'react'
import { MdLocationPin, MdLocalPhone } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";
import { useNavigate } from 'react-router-dom'
import Hero from '../assets/hero.png'
import useAppConfig from '../hooks/useAppConfig'
import useTopProducts from '../hooks/useTopProducts'
import useCategories from '../hooks/useCategories'
import useAddBasket from '../hooks/useAddBasket'
import TopProductsSwiper from '../components/TopProductsSwiper'
import CategorySwiper from '../components/swiperCategories'
import useTelegramUserId from '../hooks/useTelegramUserId'
import { parseHomeText, splitHomeTextChunks } from '../lib/homeText'

const ROW_ICONS = {
  location: MdLocationPin,
  phone: MdLocalPhone,
  schedule: IoCalendar,
}

const TextBlocks = ({ blocks }) =>
  blocks.map((block, i) => {
    if (block.type === 'paragraph') {
      return (
        <p key={i} className='text-slate-600 dark:text-white mt-3 first:mt-0'>
          {block.text}
        </p>
      )
    }
    const Icon = ROW_ICONS[block.type]
    return (
      <div key={i} className='flex items-center gap-1 my-2'>
        <Icon style={{ color: "rgb(22,113,98)" }} />
        <p>{block.text}</p>
      </div>
    )
  })

// Shown until /config has loaded (or if the 1C fields are left empty) so the page never
// looks broken/blank. The "---" lines are section separators: the home page slots the
// top-products swiper after the 1st section and the categories swiper after the 2nd
// (see lib/homeText.js).
const DEFAULT_TITLE = 'Texno Bozor'
const DEFAULT_TEXT = `Texno Bozor — zamonaviy texnika dunyosi sizning qo'lingizda. Smartfonlar, noutbuklar, gadjetlar va boshqa elektronika mahsulotlarini ishonchli va qulay tarzda xarid qiling. Biz bilan texnologiyalar har doim bir qadam yaqinroq!

Uslub, qulaylik va zamonaviylik bir joyda — har kuningizga ilhom bag'ishlaydigan texnikalar do'konimizga marhamat

---

Texno Bozorda har bir mahsulot sinovdan o'tkazilgan va sifat kafolati bilan sotiladi. Maqsadimiz — zamonaviy texnikani sizga eng qulay narxlarda va ishonchli tarzda yetkazish.

---

📍 Farg'ona vil., Qo'qon shahar, Turon ko'chasi, 6
📞 +998 90 302-33-33
🕗 Du-Sha 09:00-18:00`

const Home = () => {
  const navigate = useNavigate()
  const { config } = useAppConfig()
  const userId = useTelegramUserId()

  const { products: topProducts, loading: topLoading, registered } = useTopProducts({ userId })
  const { counts, updateQuantity } = useAddBasket()
  const { categories, loading: categoriesLoading, registered: categoriesRegistered } = useCategories(userId, 1, 20)

  const title = config?.title?.trim() || DEFAULT_TITLE
  const chunks = splitHomeTextChunks(config?.text?.trim() || DEFAULT_TEXT)
  const [introChunk, brandChunk, ...restChunks] = chunks

  const handleCategoryClick = (category) => {
    localStorage.setItem('selectedCategory', JSON.stringify(category))
    navigate('/shop')
  }

  return (
    <div className='py-24 xl:px-10 px-2 h-full'>
      <div className='sm:flex gap-3'>
        <img src={Hero} alt="Hero" className='w-full mx-auto rounded-lg' />
        <div>
          <h2 className='font-bold text-4xl my-3 sm:my-0'>{title}</h2>
          <TextBlocks blocks={parseHomeText(introChunk)} />
        </div>
      </div>

      {(topLoading || (registered && topProducts.length > 0)) && (
        <div className='mt-10'>
          <h2 className='text-2xl font-semibold mb-4'>Top mahsulotlar</h2>
          <TopProductsSwiper
            products={topProducts}
            loading={topLoading}
            registered={registered}
            counts={counts}
            onUpdate={updateQuantity}
          />
        </div>
      )}

      {brandChunk && (
        <div className='mt-10'>
          <TextBlocks blocks={parseHomeText(brandChunk)} />
        </div>
      )}

      {(categoriesLoading || (categoriesRegistered && categories.length > 0)) && (
        <div className='mt-10'>
          <h2 className='text-2xl font-semibold mb-4'>Kategoriyalar</h2>
          <CategorySwiper
            categories={categories}
            handleCategoryClick={handleCategoryClick}
            loading={categoriesLoading}
          />
        </div>
      )}

      {restChunks.map((chunk, i) => (
        <div key={i} className='mt-10'>
          <TextBlocks blocks={parseHomeText(chunk)} />
        </div>
      ))}
    </div>
  )
}

export default Home

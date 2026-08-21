import React from 'react'
import { MdLocationPin, MdLocalPhone } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";
import Hero from '../assets/hero.png'
import Card from '../components/card'
import useAppConfig from '../hooks/useAppConfig'
import useTopProducts from '../hooks/useTopProducts'
import useAddBasket from '../hooks/useAddBasket'
import { getUserId } from '../lib/auth'
import { parseHomeText } from '../lib/homeText'

const ROW_ICONS = {
  location: MdLocationPin,
  phone: MdLocalPhone,
  schedule: IoCalendar,
}

// shown until /config has loaded (or if the 1C fields are left empty) so the page never
// looks broken/blank
const DEFAULT_TITLE = 'Texno Bozor'
const DEFAULT_TEXT = `Texno Bozor — zamonaviy texnika dunyosi sizning qo'lingizda. Smartfonlar, noutbuklar, gadjetlar va boshqa elektronika mahsulotlarini ishonchli va qulay tarzda xarid qiling. Biz bilan texnologiyalar har doim bir qadam yaqinroq!

Uslub, qulaylik va zamonaviylik bir joyda — har kuningizga ilhom bag'ishlaydigan texnikalar do'konimizga marhamat

📍 Farg'ona vil., Qo'qon shahar, Turon ko'chasi, 6
📞 +998 90 302-33-33
🕗 Du-Sha 09:00-18:00`

const App = () => {
  const { config } = useAppConfig()
  const userId = getUserId()
  const { products: topProducts, loading: topLoading, registered } = useTopProducts({ userId })
  const { counts, updateQuantity } = useAddBasket()

  const title = config?.title?.trim() || DEFAULT_TITLE
  const blocks = parseHomeText(config?.text?.trim() || DEFAULT_TEXT)

  return (
    <div className='py-24 xl:px-10 px-2 h-full'>
      <div className='sm:flex gap-3'>
        <img src={Hero} alt="Hero" className='w-full mx-auto rounded-lg' />
        <div>
          <h2 className='font-bold text-4xl my-3 sm:my-0'>{title}</h2>
          {blocks.map((block, i) => {
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
          })}
        </div>
      </div>

      {(topLoading || topProducts.length > 0) && (
        <div className='mt-10'>
          <h2 className='text-2xl font-semibold mb-4'>Top mahsulotlar</h2>
          <div className='grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4'>
            {topLoading
              ? Array.from({ length: 4 }).map((_, i) => <Card key={i} loading={true} />)
              : topProducts.map(p => (
                  <Card
                    key={p.id}
                    product={p}
                    productInCart={counts[p.id]}
                    onUpdate={updateQuantity}
                    loading={false}
                    registered={registered}
                  />
                ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App

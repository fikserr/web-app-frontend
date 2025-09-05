import React from 'react'
import { MdLocationPin, MdLocalPhone } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";
import Hero from '../assets/hero.png'

const App = () => {
  return (
    <div className='px-2 mb-24 xl:px-10 mt-24'>
      <div className='sm:flex gap-3'>
        <img src={Hero} alt="Hero" className='w-full mx-auto rounded-lg' />
        <div>
          <h2 className='font-bold text-4xl my-3 sm:my-0'>Texno Bozor</h2>
          <p className='text-slate-600 dark:text-white'>Texno Bozor — zamonaviy texnika dunyosi sizning qo‘lingizda. Smartfonlar, noutbuklar, gadjetlar va boshqa elektronika mahsulotlarini ishonchli va qulay tarzda xarid qiling. Biz bilan texnologiyalar har doim bir qadam yaqinroq! <br /><br />
            Uslub, qulaylik va zamonaviylik bir joyda — har kuningizga ilhom bag‘ishlaydigan texnikalar do‘konimizga marhamat</p>
          <div className='flex items-center gap-1 my-2'>
            <MdLocationPin style={{ color: "rgb(22,113,98)" }} />
            <p>Farg'ona vil., Qo'qon shahar, Turon ko'chasi, 6</p>
          </div>
          <div className='flex items-center gap-1'>
            <MdLocalPhone style={{ color: "rgb(22,113,98)" }} />
            <p>+998 90 302-33-33</p>
          </div>
          <div className='flex items-center gap-1'>
            <IoCalendar style={{ color: "rgb(22,113,98)" }} />
            <p>Du-Sha 09:00-18:00</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

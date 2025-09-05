import React, { useEffect, useState } from 'react';
import Iphone from '../assets/iphone3.png';
import Iphone2 from '../assets/iphone2.png';
import { Link } from 'react-router-dom';

const Detail = () => {
    const [isBottom, setIsBottom] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const fullHeight = document.documentElement.scrollHeight;

            setIsBottom(scrollTop + windowHeight >= fullHeight - 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className='mb-32 grid sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:px-5 xl:px-10 mt-24'>
            <div className='grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 sm:col-span-1 md:col-span-2'>
                <img src={Iphone} alt="img1" className='mx-auto w-full rounded-xl' />
                <img src={Iphone2} alt="img2" className='mx-auto w-full rounded-xl' />
            </div>
            <div className='px-2 sm:col-span-2 md:col-span-1 lg:col-span-2'>
                <h2 className='text-xl font-bold mt-2'>iPhone 14 Pro Max</h2>
                <p className='text-4xl font-bold my-3'>7 860 000 UZS</p>
                <p className='text-slate-500'>
                    iPhone 14 Pro Max — kuch, uslub va texnologiyaning mukammal uyg‘unligi...
                </p>

                <h3 className='font-semibold text-xl mt-5'>Tavsifi</h3>
                <div className='flex justify-between px-2 border-b-2 pb-2'>
                    <p className='text-slate-500'>Operativ xotira</p>
                    <p>6 GB</p>
                </div>
                <div className='flex justify-between px-2 border-b-2 pb-2'>
                    <p className='text-slate-500'>Doimiy xotira</p>
                    <p>128 GB</p>
                </div>
                <div className='flex justify-between px-2 border-b-2 pb-2'>
                    <p className='text-slate-500'>Kamera</p>
                    <p>Asosiy-48MP / Old-12MP</p>
                </div>
                <div className='flex justify-between px-2 border-b-2 pb-2'>
                    <p className='text-slate-500'>Akkumulyator sig‘imi</p>
                    <p>4323 mAh</p>
                </div>
                <div className='flex justify-between px-2 border-b-2 pb-2'>
                    <p className='text-slate-500'>SIM-karta</p>
                    <p>eSIM</p>
                </div>
                <div className='flex justify-between px-2 border-b-2 pb-2'>
                    <p className='text-slate-500'>Korpus materiali</p>
                    <p>Mustahkam metall</p>
                </div>
                <div className='flex justify-between px-2 border-b-2 pb-2'>
                    <p className='text-slate-500'>Protsessor</p>
                    <p>Bionic</p>
                </div>
                <div className='flex justify-between px-2 border-b-2 pb-2'>
                    <p className='text-slate-500'>Displey</p>
                    <p>6.7” Super Retina XDR</p>
                </div>
            </div>
            {isBottom && (
                <>
                    <Link
                        to={'/shop'}
                        className='w-full py-2 rounded-md fixed text-center text-[rgb(22,113,98)] underline bottom-10 right-0 left-0 bg-white dark:bg-gray-900 dark:text-white'
                    >
                        Xaridlarga qaytish
                    </Link>
                    <button className='bg-[rgb(22,113,98)] w-full py-2 text-white rounded-md fixed bottom-0 right-0 left-0'>
                        Savatga Qo'shish
                    </button>
                </>
            )}
        </div>
    );
};

export default Detail;

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../lib/api'
import useAddBasket from '../hooks/useAddBasket'
import { toast } from 'sonner'
import NoImage from '../assets/no-photo.jpg'
import { resolveDisplayPrice } from '../lib/pricing'

const Detail = () => {
    const [isBottom, setIsBottom] = useState(false);
    const location = useLocation()
    // card.jsx passes the product it already fetched (from /catalogs/products/full, so it's
    // complete — description included) via navigation state. Only hit the API when that's
    // missing, e.g. someone opened /detail/:id directly instead of navigating in-app.
    const [product, setProduct] = useState(location.state?.product || null)
    const [loading, setLoading] = useState(!location.state?.product)
    const { id } = useParams()
    const { counts, updateQuantity } = useAddBasket()

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

    useEffect(() => {
        if (!id || location.state?.product) return
        let cancelled = false
        setLoading(true)
        api.get(`/product/${id}`).then(res => {
            if (cancelled) return
            const p = res.data?.data || res.data || null
            setProduct(p)
        }).catch(async () => {
            // fallback to query by id
            try {
                const r2 = await api.get('/product', { params: { id } })
                const p2 = r2.data?.data?.[0] || r2.data?.data || r2.data || null
                if (!cancelled) setProduct(p2)
            } catch (e) {
                console.error('Product fetch error', e)
            }
        }).finally(() => {
            if (!cancelled) setLoading(false)
        })
        return () => { cancelled = true }
    }, [id, location.state])

    if (loading) return <div className='py-24 text-center'>Yuklanmoqda...</div>
    if (!product) return <div className='py-24 text-center'>Mahsulot topilmadi</div>

    const displayPrice = resolveDisplayPrice(product)
    const description = product.description || product.shortDescription || product.desc || product.opisanie || product.note || ''

    const addToCart = () => {
        try {
            const current = counts[product.id]?.count || 0
            updateQuantity(product, current + 1)
            toast.success('Mahsulot savatga qo‘shildi')
        } catch (e) {
            console.error('Add to cart error', e)
            toast.error('Savatga qo‘shishda xatolik')
        }
    }

    return (
        <div className='mb-32 grid sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:px-5 xl:px-10 mt-24'>
            <div className='sm:col-span-1 md:col-span-2'>
                <img src={product.imageUrl || NoImage} alt={product.name} className='mx-auto w-full rounded-xl' />
            </div>
            <div className='px-2 sm:col-span-2 md:col-span-1 lg:col-span-2'>
                <h2 className='text-xl font-bold mt-2'>{product.name}</h2>
                <p className='text-4xl font-bold my-3'>
                    {displayPrice.price != null
                        ? `${displayPrice.price.toLocaleString('fr-FR').replace(/\s/g, ' ')} so'm`
                        : 'Narx belgilanmagan'}
                </p>
                {description && (
                    <p className='text-slate-500'>
                        {description}
                    </p>
                )}

                {(product.attributes || []).length > 0 && (
                    <>
                        <h3 className='font-semibold text-xl mt-5'>Tavsifi</h3>
                        {product.attributes.map(attr => (
                            <div key={attr.name} className='flex justify-between px-2 border-b-2 pb-2'>
                                <p className='text-slate-500'>{attr.name}</p>
                                <p>{attr.value}</p>
                            </div>
                        ))}
                    </>
                )}
            </div>
            {isBottom && (
                <>
                    <Link
                        to={'/shop'}
                        className='w-full py-2 rounded-md fixed text-center text-[rgb(22,113,98)] underline bottom-10 right-0 left-0 bg-white dark:bg-gray-900 dark:text-white'
                    >
                        Xaridlarga qaytish
                    </Link>
                    <button
                        onClick={addToCart}
                        disabled={displayPrice.price == null}
                        className='bg-[rgb(22,113,98)] disabled:opacity-50 w-full py-2 text-white rounded-md fixed bottom-0 right-0 left-0'
                    >
                        Savatga Qo'shish
                    </button>
                </>
            )}
        </div>
    );
};

export default Detail;

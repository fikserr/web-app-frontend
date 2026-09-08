import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import api from '../lib/api'
import useAddBasket from '../hooks/useAddBasket'
import { toast } from 'sonner'
import NoImage from '../assets/no-photo.jpg'
import { resolveDisplayPrice } from '../lib/pricing'
import useAppConfig from '../hooks/useAppConfig'

const Detail = () => {
    const location = useLocation()
    // card.jsx passes the product it already fetched (from /catalogs/products/full, so it's
    // complete — description included) via navigation state. Only hit the API when that's
    // missing, e.g. someone opened /detail/:id directly instead of navigating in-app.
    const [product, setProduct] = useState(location.state?.product || null)
    const [loading, setLoading] = useState(!location.state?.product)
    const { id } = useParams()
    const { counts, updateQuantity } = useAddBasket()
    // re-renders once the USD→UZS rate arrives from /config (see card.jsx for why)
    useAppConfig()

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
            } catch {
                // ignore — product stays null, "Mahsulot topilmadi" renders below
            }
        }).finally(() => {
            if (!cancelled) setLoading(false)
        })
        return () => { cancelled = true }
    }, [id, location.state])

    if (loading) return <div className='py-24 text-center'>Yuklanmoqda...</div>
    if (!product) return <div className='py-24 text-center'>Mahsulot topilmadi</div>

    const displayPrice = resolveDisplayPrice(product)
    // "info" is the canonical description field returned by /catalogs/products/full;
    // the rest are kept as fallbacks for older/other product shapes
    const description = product.info || product.description || product.shortDescription || product.desc || product.opisanie || product.note || ''
    const productCount = counts[product.id]?.count || 0
    const hasDiscount = displayPrice.price != null && displayPrice.oldPrice > displayPrice.price

    const addToCart = () => {
        try {
            updateQuantity(product, productCount + 1)
            toast.success('Mahsulot savatga qo‘shildi', { duration: 2000 })
        } catch {
            toast.error('Savatga qo‘shishda xatolik')
        }
    }

    // once the product is in the basket, the button below turns into a -/qty/+
    // stepper (same pattern as card.jsx) so the customer can pick a quantity
    // without tapping "Savatga qo'shish" once per unit
    const changeQuantity = qty => {
        try {
            updateQuantity(product, qty)
        } catch {
            toast.error('Savatga qo‘shishda xatolik')
        }
    }

    return (
        <div className='pb-28 mt-24 px-4 sm:px-6 xl:px-10 max-w-4xl mx-auto'>
            <div className='sm:grid sm:grid-cols-2 sm:gap-8'>
                <div className='rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 sm:sticky sm:top-20 sm:self-start'>
                    <img
                        src={product.imageUrl || NoImage}
                        alt={product.name}
                        className='w-full aspect-square object-contain'
                        onError={e => {
                            if (e.currentTarget.src !== NoImage) e.currentTarget.src = NoImage
                        }}
                    />
                </div>

                <div className='mt-4 sm:mt-0'>
                    <h1 className='text-lg font-semibold leading-snug'>{product.name}</h1>

                    <div className='mt-2 flex items-baseline gap-2 flex-wrap'>
                        <p className='text-3xl font-bold'>
                            {displayPrice.price != null
                                ? `${displayPrice.price.toLocaleString('fr-FR').replace(/\s/g, ' ')} so'm`
                                : 'Narx belgilanmagan'}
                        </p>
                        {hasDiscount && (
                            <p className='text-base text-gray-400 line-through'>
                                {displayPrice.oldPrice.toLocaleString('fr-FR').replace(/\s/g, ' ')} so'm
                            </p>
                        )}
                    </div>

                    {description && (
                        <div className='mt-5'>
                            <h2 className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1'>
                                Tavsif
                            </h2>
                            <p className='text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed'>
                                {description}
                            </p>
                        </div>
                    )}

                    {(product.attributes || []).length > 0 && (
                        <div className='mt-5'>
                            <h2 className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2'>
                                Xususiyatlari
                            </h2>
                            <div className='rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700'>
                                {product.attributes.map(attr => (
                                    <div
                                        key={attr.name}
                                        className='flex justify-between gap-3 px-3 py-2 odd:bg-gray-50 dark:odd:bg-gray-800/60'
                                    >
                                        <p className='text-gray-500 dark:text-gray-400 text-sm'>{attr.name}</p>
                                        <p className='text-sm text-right font-medium'>{attr.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* har doim ko'rinadi — oldin "isBottom" bo'lganda, ya'ni sahifa oxirigacha
                skroll qilinganda gina chiqardi, bu esa qisqa savatga qo'shish tugmasini
                topishni qiyinlashtirardi */}
            <div
                className='fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 pt-3'
                style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
            >
                {productCount > 0 ? (
                    <div className='flex items-center justify-center gap-4'>
                        <button
                            onClick={() => changeQuantity(productCount - 1)}
                            className='px-4 py-2 bg-[rgb(141,119,229)] rounded-lg text-white text-xl leading-none'
                        >
                            −
                        </button>
                        <input
                            type='number'
                            min='0'
                            value={productCount}
                            onChange={e => changeQuantity(Number(e.target.value))}
                            title='Miqdor'
                            className='w-16 text-center rounded-lg py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                        />
                        <button
                            onClick={() => changeQuantity(productCount + 1)}
                            className='px-4 py-2 bg-[rgb(141,119,229)] rounded-lg text-white text-xl leading-none'
                        >
                            +
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={addToCart}
                        disabled={displayPrice.price == null}
                        className='w-full py-3 bg-[rgb(141,119,229)] disabled:opacity-50 text-white rounded-lg font-medium'
                    >
                        Savatga qo'shish
                    </button>
                )}
            </div>
        </div>
    );
};

export default Detail;

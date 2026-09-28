import axios from 'axios'
import { useState } from 'react'
import { BsBagHeart } from 'react-icons/bs'
import { toast } from 'sonner'
import noImage from '../assets/no-photo.jpg'
import CommentModal from '../components/CommentModal'
import ErrorModal from '../components/ErrorModal'
import PaymentModal from '../components/PaymentModal'
import useAddBasket from '../hooks/useAddBasket'
import useBasket from '../hooks/useBasket'
import useOrder from '../hooks/useOrder'
import { getTokenContractor, getTokenStock, getUserId } from '../lib/auth'
import { getTokenCurrencyId, resolveDisplayPrice } from '../lib/pricing'

const Basket = () => {
const [showCommentModal, setShowCommentModal] = useState(false)
const [showPaymentModal, setShowPaymentModal] = useState(false)
const [showErrorModal, setShowErrorModal] = useState(false)
const [comment, setComment] = useState('')
const [submitting, setSubmitting] = useState(false)

const { basket, setBasket, clearBasket } = useBasket()
const { createOrder } = useOrder()
const { counts, updateQuantity } = useAddBasket()

const subtotal = basket.reduce((sum, item) => {
const count = counts[item.productId]?.count || 0
return sum + Number(item.price || 0) * count
}, 0)

const handleConfirmOrder = async paymentType => {
if (!basket.length) {
console.warn('⚠️ BASKET BO‘SH')
return
}

const invalidItem = basket.find(item => {
const productId = item.productId || item.Id || item.id
const productQty = Number(counts[productId]?.count || 0)
const maxQty = [
item?.quantities?.[0]?.remainder,
item?.remainder,
item?.remainders?.[0]?.remainder,
item?.stock?.remainder,
item?.quantity,
item?.availableQuantity,
].find(value => Number.isFinite(Number(value)) && Number(value) >= 0)

return maxQty != null && productQty > Number(maxQty)
})

if (invalidItem) {
const productName = invalidItem.name || 'Mahsulot'
toast.error(`${productName} uchun qoldiqdan ko‘p miqdorda buyurtma qila olmaysiz.`, {
style: {
background: '#ef4444',
color: '#fff',
fontWeight: 'bold',
borderRadius: '12px',
padding: '16px 24px',
fontSize: '16px',
},
})
return
}

console.group('🛒 BUYURTMA YUBORISH')
console.log('📦 Basket:', basket)
console.log('🔢 Counts:', counts)
console.log('💳 Payment type:', paymentType)
console.groupEnd()

const generateUuidFallback = () => {
if (
typeof crypto !== 'undefined' &&
typeof crypto.randomUUID === 'function'
) {
return crypto.randomUUID()
}

return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
/[xy]/g,
char => {
const random = (Math.random() * 16) | 0
const value =
char === 'x'
? random
: (random & 0x3) | 0x8

return value.toString(16)
}
)
}

const tokenStock = getTokenStock()
const tokenContractor = getTokenContractor()

const products = basket.map(item => {
const productId = item.productId || item.Id || item.id
const quantity = counts[productId]?.count || 0
const rawPriceFallback =
item.price == null && Array.isArray(item.prices)
? resolveDisplayPrice(item)
: null
const price = Number(item.price ?? rawPriceFallback?.price ?? 0)
const measure =
item.measures?.[0] ||
item.measure || {
id: '09fda8fe-6098-11f0-9fee-b48c9d79c2ce',
name: 'шт',
}

const productData = {
product: {
id: productId,
name: item.name || item.productName || 'Mahsulot',
},
bundleItems: [],
quantities: [
{
stock: {
id: tokenStock.id,
name: tokenStock.name,
},
quantity,
measure: {
name: measure.name || 'шт',
id:
measure.Id ||
measure.id ||
'09fda8fe-6098-11f0-9fee-b48c9d79c2ce',
},
remainder: 0,
amount: Number((quantity * price).toFixed(4)),
},
],
price: Number(price.toFixed(4)),
oldPrice: Number(
(item.oldPrice ?? rawPriceFallback?.oldPrice ?? price).toFixed(4)
),
currency: {
name:
item.currencyName ||
rawPriceFallback?.currency?.name ||
'UZS',
id:
getTokenCurrencyId() ||
item.currencyId ||
rawPriceFallback?.currency?.id ||
'',
},
}

return productData
})

const orderData = {
userId: String(getUserId() || ''),
UUID: generateUuidFallback(),
stock: tokenStock,
contractor: tokenContractor,
comment: comment?.trim() || '',
saleType: 'sum',
products,
}

console.group('📤 ORDER POST REQUEST')
console.log('🌐 createOrder() ga yuborilayotgan DATA:')
console.log(orderData)
console.log('📋 JSON ko‘rinishida:', JSON.stringify(orderData, null, 2))
console.log('👤 userId:', orderData.userId)
console.log('🆔 UUID:', orderData.UUID)
console.log('💬 comment:', orderData.comment)
console.log('💰 saleType:', orderData.saleType)
console.log('📦 products:', orderData.products)
console.groupEnd()

if (submitting) {
console.warn('⚠️ Buyurtma allaqachon yuborilmoqda')
return
}

setSubmitting(true)

try {
if (paymentType === 'click') {
const amount = basket.reduce(
(acc, item) => acc + item.price * (counts[item.Id]?.count || 0),
0
)

const CLICK_PAYMENT_URL =
import.meta.env.VITE_CLICK_PAYMENT_URL ||
'https://clickpayment-production.up.railway.app/api/click/create-payment'

const clickPayload = {
order_id: orderData.UUID,
amount,
}

console.group('💳 CLICK POST REQUEST')
console.log('🌐 URL:', CLICK_PAYMENT_URL)
console.log('📤 DATA:', clickPayload)
console.log('📋 JSON:', JSON.stringify(clickPayload, null, 2))
console.groupEnd()

const res = await axios.post(CLICK_PAYMENT_URL, clickPayload)

console.group('📥 CLICK RESPONSE')
console.log('Status:', res.status)
console.log('Status text:', res.statusText)
console.log('Headers:', res.headers)
console.log('Data:', res.data)
console.log('📋 JSON:', JSON.stringify(res.data, null, 2))
console.groupEnd()

if (res.data?.success && res.data?.paymentUrl) {
console.log('✅ CLICK PAYMENT URL:', res.data.paymentUrl)
window.location.href = res.data.paymentUrl
return
}

console.error('❌ CLICK RESPONSE KUTILGAN FORMATDA EMAS:', res.data)
toast.error("To'lov havolasi topilmadi, qayta urinib ko'ring", {
style: {
background: '#ef4444',
color: '#fff',
fontWeight: 'bold',
borderRadius: '12px',
padding: '16px 24px',
fontSize: '16px',
},
})
return
}

console.group('🚀 CREATE ORDER')
console.log('📤 Backendga yuborilayotgan orderData:')
console.log(orderData)
console.log('📋 JSON:', JSON.stringify(orderData, null, 2))
console.groupEnd()

const response = await createOrder(orderData)

console.group('📥 CREATE ORDER RESPONSE')
console.log('✅ createOrder() response:', response)
console.log('📋 Response JSON:', JSON.stringify(response, null, 2))
console.groupEnd()

console.log('✅ BUYURTMA MUVAFFAQIYATLI YUBORILDI')

clearBasket()
setShowPaymentModal(false)
setShowCommentModal(false)

toast.success('Buyurtma qabul qilindi!', {
style: {
background: '#22c55e',
color: '#fff',
fontWeight: 'bold',
borderRadius: '12px',
padding: '16px 24px',
fontSize: '16px',
},
})
} catch (err) {
console.group('❌❌❌ ORDER ERROR')
console.error('❌ XATO OBYEKT:', err)
console.error('❌ ERROR MESSAGE:', err?.message)
console.error('❌ ERROR NAME:', err?.name)
console.error('❌ ERROR CODE:', err?.code)
console.error('❌ ERROR STACK:', err?.stack)

if (err?.response) {
console.error('📡 RESPONSE:', err.response)
console.error('📊 STATUS:', err.response.status)
console.error('📊 STATUS TEXT:', err.response.statusText)
console.error('📥 BACKEND DATA:', err.response.data)
console.error('📋 BACKEND JSON:', JSON.stringify(err.response.data, null, 2))
console.error('📨 RESPONSE HEADERS:', err.response.headers)
}

if (err?.request) {
console.error('📤 REQUEST:', err.request)
}

console.error('📦 YUBORILGAN ORDER DATA:', orderData)
console.error('📋 YUBORILGAN JSON:', JSON.stringify(orderData, null, 2))
console.groupEnd()

setShowErrorModal(true)
setShowPaymentModal(false)

const backendMessage = Array.isArray(err?.response?.data?.errorMessage)
? err.response.data.errorMessage.join('; ')
: err?.response?.data?.errorMessage

toast.error(
backendMessage ||
"Buyurtma yuborishda muammo yuz berdi, qayta urinib ko'ring",
{
style: {
background: '#ef4444',
color: '#fff',
fontWeight: 'bold',
borderRadius: '12px',
padding: '16px 24px',
fontSize: '16px',
},
}
)
} finally {
setSubmitting(false)
}
}

return (
<div className='px-1 pb-28 pt-5 sm:px-2'>
<div className='mb-5 flex items-center justify-between'>
<h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>Savat</h2>
{basket.length > 0 && (
<span className='rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'>
{basket.length} mahsulot
</span>
)}
</div>

{basket.length === 0 ? (
<div className='soft-card mx-auto flex max-w-xl flex-col items-center justify-center gap-4 py-20 text-center'>
<BsBagHeart className='text-5xl text-violet-600' />
<h3 className='text-xl font-semibold text-slate-800 dark:text-slate-100'>
Sizning savatingiz bo\'sh.
</h3>
<p className='text-sm text-slate-600 dark:text-slate-300'>
Mahsulotlarni tanlab, buyurtma berishni boshlang.
</p>
</div>
) : (
<div className='space-y-4'>
<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
{basket.map(item => (
<div key={item.productId} className='soft-card flex gap-3 p-3'>
<div className='h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-50 p-2 dark:bg-slate-800'>
<img
src={item.image || noImage}
alt={item.name || 'Mahsulot'}
className='h-full w-full object-contain'
/>
</div>

<div className='flex min-w-0 flex-1 flex-col justify-between'>
<p className='text-sm font-semibold leading-5 text-slate-800 dark:text-slate-100'>
{item.name || 'Mahsulot'}
</p>

<div className='mt-2 flex items-center justify-between gap-2'>
<p className='text-sm font-bold text-violet-700 dark:text-violet-300'>
{item.price != null
? `${Number(item.price)
.toLocaleString('fr-FR', {
maximumFractionDigits: 4,
})
.replace(/\s/g, ' ')} so'm`
: 'Narx belgilanmagan'}
</p>

<div className='flex items-center gap-2'>
<button
type='button'
onClick={() => {
const newCount = (counts[item.productId]?.count || 0) - 1
if (newCount <= 0) {
const updatedBasket = basket.filter(
b => b.productId !== item.productId
)
setBasket(updatedBasket)
updateQuantity(item, 0)
} else {
updateQuantity(item, newCount)
}
}}
className='flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-lg font-semibold text-white'
>
−
</button>
<span className='min-w-[18px] text-center text-sm font-semibold text-slate-700 dark:text-slate-200'>
{counts[item.productId]?.count || 0}
</span>
<button
type='button'
onClick={() =>
updateQuantity(item, (counts[item.productId]?.count || 0) + 1)
}
className='flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-lg font-semibold text-white'
>
+
</button>
</div>
</div>

<div className='mt-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300'>
<span>Summa</span>
<span className='font-semibold text-slate-900 dark:text-slate-100'>
{item.price != null
? `${Number((counts[item.productId]?.count || 0) * item.price)
.toLocaleString('fr-FR', {
maximumFractionDigits: 4,
})
.replace(/\s/g, ' ')} so'm`
: 'Narx belgilanmagan'}
</span>
</div>
</div>
</div>
))}
</div>

<div className='soft-card sticky bottom-24 mt-4 p-4'>
<div className='flex items-center justify-between text-sm text-slate-600 dark:text-slate-300'>
<span>Umumiy summa</span>
<span className='text-lg font-bold text-slate-900 dark:text-slate-100'>
{subtotal
.toLocaleString('fr-FR', { maximumFractionDigits: 4 })
.replace(/\s/g, ' ')} so'm
</span>
</div>
</div>
</div>
)}

{basket.length > 0 && (
<button
type='button'
onClick={() => setShowCommentModal(true)}
className='fixed inset-x-4 bottom-24 z-40 mx-auto flex w-[min(22rem,calc(100%-2rem))] items-center justify-center rounded-2xl bg-violet-600 px-4 py-3 text-base font-semibold text-white shadow-[0_16px_32px_rgba(124,58,237,0.32)] transition hover:bg-violet-500'
>
Buyurtma berish
</button>
)}

<CommentModal
showCommentModal={showCommentModal}
setShowCommentModal={setShowCommentModal}
comment={comment}
setComment={setComment}
setShowPaymentModal={setShowPaymentModal}
basket={basket}
counts={counts}
/>

<PaymentModal
showPaymentModal={showPaymentModal}
setShowPaymentModal={setShowPaymentModal}
handleConfirmOrder={handleConfirmOrder}
/>

{showErrorModal && <ErrorModal setShowErrorModal={setShowErrorModal} />}
</div>
)
}

export default Basket

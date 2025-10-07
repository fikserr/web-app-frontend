import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { BsBagHeart } from 'react-icons/bs'
import { PiWarningCircle } from 'react-icons/pi'
import { useNavigate } from 'react-router-dom'
import noImage from '../assets/no-photo.jpg'
import useAddBasket from '../hooks/useAddBasket'
import useBasket from '../hooks/useBasket'
import useOrder from '../hooks/useOrder'

const Basket = () => {
	const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
	// const tgUser = { id: 1284897972 }

	const [showCommentModal, setShowCommentModal] = useState(false)
	const [showConfirmModal, setShowConfirmModal] = useState(false)
	const [showErrorModal, setShowErrorModal] = useState(false)
	const [comment, setComment] = useState('')
	const navigate = useNavigate()

	const tzOffset = 5 * 60 // UTC+5
	const localDate = new Date(Date.now() + tzOffset * 60 * 1000)
	const { basket, setBasket, clearBasket } = useBasket()
	const { counts, updateQuantity } = useAddBasket()
	const { createOrder, loading: orderLoading, error: orderError } = useOrder()
	const formatted = localDate.toISOString().slice(0, 19)

	// ✅ Confirm order logic (unchanged)
	const handleConfirmOrder = async () => {
		if (!basket.length) return

		const orderData = {
			userId: String(tgUser?.id),
			UUID: crypto.randomUUID(),
			date: formatted,
			comment: comment?.trim() || '',
			basket: basket.map(item => ({
				productId: item.Id,
				measureId: item.measures?.[0]?.Id,
				quantity: counts[item.Id]?.count || 0,
				price: item.price,
			})),
		}

		try {
			const res = await createOrder(orderData)
			console.log('✅ Buyurtma yuborildi:', res)

			clearBasket()
			localStorage.removeItem('basket')
			setShowConfirmModal(false)
			setShowCommentModal(false)
			toast.success('✅ Buyurtmangiz muvaffaqiyatli qabul qilindi!')
		} catch (err) {
			console.error('❌ Buyurtma xatolik:', err)
			setShowErrorModal(true)
			setShowConfirmModal(false)
		}
	}

	const formatCurrency = amount => {
		if (!amount) return "0 so'm"
		return new Intl.NumberFormat('uz-UZ', {
			style: 'currency',
			currency: 'UZS',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		})
			.format(amount)
			.replace('UZS', "so'm")
	}

	return (
		<div className='px-3 xl:px-10 py-24'>
			<h2 className='text-3xl font-bold'>Savat</h2>

			{basket.length === 0 ? (
				<div>
					<div className='max-w-xl mx-auto py-20 bg-gray-100 rounded-lg flex flex-col items-center mt-5 md:hidden dark:bg-gray-800'>
						<BsBagHeart className='text-5xl text-[rgb(22,113,98)] mb-3' />
						<p className='text-lg text-gray-600 dark:text-gray-200'>
							Sizning savatingiz bo'sh.
						</p>
					</div>
				</div>
			) : (
				<div className='mt-5 mb-10 grid md:grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4'>
					{basket.map(item => (
						<div
							key={item.productId}
							className='flex items-center gap-4 bg-white rounded-xl shadow-md px-2 py-2 border dark:bg-gray-800'
						>
							<div className='rounded-xl h-full w-24'>
								<img
									src={item.image || noImage}
									alt={item.name}
									className='w-full aspect-square object-cover rounded-xl'
								/>
							</div>
							<div className='w-2/3'>
								<p className='text-sm font-bold text-black h-[40px] max-h-[40px] dark:text-white'>
									{item.name}
								</p>
								<div className='flex items-end justify-between'>
									<div className='w-full'>
										<div className='flex items-center justify-between w-full'>
											<p className='text-sm font-bold mt-1 text-[rgb(26,134,116)]'>
												${item.price}
											</p>
											<div className='flex justify-between items-center gap-2 mt-2'>
												<button
													onClick={() => {
														const newCount =
															(counts[item.productId]?.count || 0) - 1
														if (newCount <= 0) {
															const updatedBasket = basket.filter(
																b => b.productId !== item.productId
															)
															localStorage.setItem(
																'basket_counts',
																JSON.stringify(updatedBasket)
															)
															setBasket(updatedBasket)
															updateQuantity(item, 0)
														} else {
															updateQuantity(item, newCount)
														}
													}}
													className='px-2 bg-[rgb(22,113,98)] rounded text-white dark:bg-[rgb(22,113,98)] dark:bg-opacity-50 dark:text-emerald-500'
												>
													−
												</button>
												<button
													onClick={() =>
														updateQuantity(
															item,
															(counts[item.productId]?.count || 0) + 1
														)
													}
													className='px-2 bg-[rgb(22,113,98)] rounded text-white dark:bg-[rgb(22,113,98)] dark:bg-opacity-50 dark:text-emerald-500'
												>
													+
												</button>
											</div>
										</div>
										<div className='flex justify-between w-full'>
											<p className='text-gray-500 mt-1 text-sm dark:text-gray-300'>
												Miqdori:{' '}
												<span className='text-[rgb(41,185,161)]'>
													{counts[item.productId]?.count || 0}
												</span>
											</p>
											<p className='text-gray-500 mt-1 text-sm dark:text-gray-300'>
												Summa:{' '}
												{(counts[item.productId]?.count || 0) * item.price}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{basket.length > 0 && (
				<Button
					onClick={() => setShowCommentModal(true)}
					className='bg-[rgb(22,113,98)] w-80 py-2 text-white mx-auto rounded-md fixed bottom-20 right-0 left-0'
				>
					Buyurtma berish
				</Button>
			)}

			{/* 🟢 Step 1 — Comment Modal (ShadCN) */}
			<Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
				<DialogContent
					aria-describedby={undefined}
					className='bg-white text-black rounded-xl max-w-sm w-10/12 dark:bg-gray-700 dark:text-white'
				>
					<DialogHeader>
						<DialogTitle className='text-center font-semibold text-lg dark:text-white'>
							Buyurtmangiz uchun izoh qoldirasizmi?
						</DialogTitle>
					</DialogHeader>

					<div className='mt-3 flex flex-col gap-4 '>
						<Textarea
							placeholder='Izox...'
							value={comment}
							onChange={e => setComment(e.target.value)}
							className='w-full border-gray-300 resize-y h-36'
						/>
						<p className='text-lg'>
							Jami summa:{' '}
							{formatCurrency(
								basket.reduce(
									(acc, item) =>
										acc + item.price * counts[item.productId]?.count,
									0
								)
							)}
						</p>
					</div>

					<DialogFooter className='flex justify-between mt-3 flex-row'>
						<Button
							variant='outline'
							className='w-1/2 mr-2 dark:text-white'
							onClick={() => {
								setComment('ixtiyoriy')
								setShowCommentModal(false)
							}}
						>
							Ortga qaytish
						</Button>

						<Button
							className='bg-[rgb(22,113,98)] w-1/2 text-white'
							onClick={() => {
								setShowCommentModal(false)
								handleConfirmOrder()
							}}
						>
							Tasdiqlash
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ❌ Error Modal */}
			{showErrorModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
					<div className='bg-white rounded-lg p-6 w-80 shadow-lg text-center relative'>
						<PiWarningCircle className='flex justify-center w-full text-4xl text-red-700' />
						<h3 className='text-lg font-semibold my-5 mb-14 text-black'>
							Avval ro'yxatdan o'ting !
						</h3>
						<div className='flex justify-around mt-4'>
							<button
								className='w-full absolute bottom-0 left-0 py-2 border-r-2 border-t-2 text-black'
								onClick={() => {
									setShowErrorModal(false)
									navigate('/')
								}}
							>
								Orqaga
							</button>
						</div>
					</div>
				</div>
			)}

			{orderError && (
				<p className='text-red-500 text-center mt-4'>
					{/* ❌ Buyurtma xatolik: {String(orderError)} */}
				</p>
			)}
			<Toaster position='top-center' reverseOrder={false} />
		</div>
	)
}

export default Basket

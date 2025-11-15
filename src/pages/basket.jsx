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

const Basket = () => {
	// const tgUser = { id: 1284897972 }
	const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user

	const [showCommentModal, setShowCommentModal] = useState(false)
	const [showPaymentModal, setShowPaymentModal] = useState(false)
	const [showErrorModal, setShowErrorModal] = useState(false)
	const [comment, setComment] = useState('')

	const { basket, setBasket, clearBasket } = useBasket()
	const { createOrder } = useOrder()

	const tzOffset = 5 * 60
	const localDate = new Date(Date.now() + tzOffset * 60 * 1000)
	const formatted = localDate.toISOString().slice(0, 19)
	const { counts, updateQuantity } = useAddBasket()

	// Handle order confirmation
	const handleConfirmOrder = async paymentType => {
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
			if (paymentType === 'click') {
				const amount = basket.reduce(
					(acc, item) => acc + item.price * (counts[item.Id]?.count || 0),
					0
				)

				const res = await axios.post(
					'https://clickpayment-production.up.railway.app/api/click/create-payment',
					{
						order_id: orderData.UUID, // har bir buyurtma uchun unique ID
						amount,
					}
				)

				if (res.data?.success && res.data?.paymentUrl) {
					window.location.href = res.data.paymentUrl // foydalanuvchini Click sahifasiga yo‘naltiramiz
					return
				} else {
					toast.error('To‘lov havolasi topilmadi, qayta urinib ko‘ring', {
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
			}

			const res = await createOrder(orderData)

			clearBasket()
			localStorage.removeItem('basket')
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
			// console.log('bajarildi')
		} catch (err) {
			console.error('❌ Buyurtma xatolik:', err)
			setShowErrorModal(true)
			setShowPaymentModal(false)

			toast.error(
				'Buyurtma yuborishda muammo yuz berdi, qayta urinib ko‘ring',
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
		}
	}

	return (
		<div className='px-3 xl:px-10 py-24'>
			<h2 className='text-3xl font-bold'>Savat</h2>

			{/* Empty basket */}
			{basket.length === 0 ? (
				<div className='max-w-xl mx-auto py-20 bg-gray-100 rounded-lg flex flex-col items-center mt-5 dark:bg-gray-800'>
					<BsBagHeart className='text-5xl text-[rgb(22,113,98)] mb-3' />
					<p className='text-lg text-gray-600 dark:text-gray-200'>
						Sizning savatingiz bo'sh.
					</p>
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

			{/* Order button */}
			{basket.length > 0 && (
				<button
					onClick={() => setShowCommentModal(true)}
					className='bg-[rgb(22,113,98)] w-80 py-2 text-white mx-auto rounded-md fixed bottom-20 right-0 left-0 '
				>
					Buyurtma berish
				</button>
			)}

			{/* Modals */}
			<CommentModal
				showCommentModal={showCommentModal}
				setShowCommentModal={setShowCommentModal}
				comment={comment}
				setComment={setComment}
				setShowPaymentModal={setShowPaymentModal}
				basket={basket}
				counts={counts}
				handleConfirmOrder={handleConfirmOrder}
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
//
//
export default Basket

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

	const handleConfirmOrder = async paymentType => {
		if (!basket.length) {
			console.warn('⚠️ BASKET BO‘SH')
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
			const productId =
				item.productId || item.Id || item.id

			const quantity =
				counts[productId]?.count || 0

			const rawPriceFallback =
				item.price == null &&
				Array.isArray(item.prices)
					? resolveDisplayPrice(item)
					: null

			const price = Number(
				item.price ??
					rawPriceFallback?.price ??
					0
			)

			const measure =
				item.measures?.[0] ||
				item.measure || {
					id: '09fda8fe-6098-11f0-9fee-b48c9d79c2ce',
					name: 'шт',
				}

			const productData = {
				product: {
					id: productId,
					name:
						item.name ||
						item.productName ||
						'Mahsulot',
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

						amount: Number(
							(quantity * price).toFixed(4)
						),
					},
				],

				price: Number(price.toFixed(4)),

				oldPrice: Number(
					(
						item.oldPrice ??
						rawPriceFallback?.oldPrice ??
						price
					).toFixed(4)
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

		// ==========================================
		// POST YUBORILADIGAN TO‘LIQ DATA
		// ==========================================

		console.group('📤 ORDER POST REQUEST')

		console.log('🌐 createOrder() ga yuborilayotgan DATA:')
		console.log(orderData)

		console.log(
			'📋 JSON ko‘rinishida:',
			JSON.stringify(orderData, null, 2)
		)

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
			// ==========================================
			// CLICK PAYMENT
			// ==========================================

			if (paymentType === 'click') {
				const amount = basket.reduce(
					(acc, item) =>
						acc +
						item.price *
							(counts[item.Id]?.count || 0),
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

				console.log(
					'🌐 URL:',
					CLICK_PAYMENT_URL
				)

				console.log(
					'📤 DATA:',
					clickPayload
				)

				console.log(
					'📋 JSON:',
					JSON.stringify(
						clickPayload,
						null,
						2
					)
				)

				console.groupEnd()

				const res = await axios.post(
					CLICK_PAYMENT_URL,
					clickPayload
				)

				// CLICK RESPONSE
				console.group('📥 CLICK RESPONSE')

				console.log('Status:', res.status)
				console.log('Status text:', res.statusText)
				console.log('Headers:', res.headers)
				console.log('Data:', res.data)

				console.log(
					'📋 JSON:',
					JSON.stringify(
						res.data,
						null,
						2
					)
				)

				console.groupEnd()

				if (
					res.data?.success &&
					res.data?.paymentUrl
				) {
					console.log(
						'✅ CLICK PAYMENT URL:',
						res.data.paymentUrl
					)

					window.location.href =
						res.data.paymentUrl

					return
				} else {
					console.error(
						'❌ CLICK RESPONSE KUTILGAN FORMATDA EMAS:',
						res.data
					)

					toast.error(
						"To'lov havolasi topilmadi, qayta urinib ko'ring",
						{
							style: {
								background:
									'#ef4444',
								color: '#fff',
								fontWeight:
									'bold',
								borderRadius:
									'12px',
								padding:
									'16px 24px',
								fontSize:
									'16px',
							},
						}
					)

					return
				}
			}

			// ==========================================
			// ASOSIY ORDER POST
			// ==========================================

			console.group('🚀 CREATE ORDER')

			console.log(
				'📤 Backendga yuborilayotgan orderData:'
			)

			console.log(orderData)

			console.log(
				'📋 JSON:',
				JSON.stringify(
					orderData,
					null,
					2
				)
			)

			console.groupEnd()

			const response = await createOrder(orderData)

			// ==========================================
			// BACKEND RESPONSE
			// ==========================================

			console.group('📥 CREATE ORDER RESPONSE')

			console.log(
				'✅ createOrder() response:',
				response
			)

			console.log(
				'📋 Response JSON:',
				JSON.stringify(
					response,
					null,
					2
				)
			)

			console.groupEnd()

			console.log(
				'✅ BUYURTMA MUVAFFAQIYATLI YUBORILDI'
			)

			clearBasket()
			setShowPaymentModal(false)
			setShowCommentModal(false)

			toast.success(
				'Buyurtma qabul qilindi!',
				{
					style: {
						background: '#22c55e',
						color: '#fff',
						fontWeight: 'bold',
						borderRadius: '12px',
						padding: '16px 24px',
						fontSize: '16px',
					},
				}
			)
		} catch (err) {
			// ==========================================
			// TO‘LIQ ERROR
			// ==========================================

			console.group('❌❌❌ ORDER ERROR')

			console.error(
				'❌ XATO OBYEKT:',
				err
			)

			console.error(
				'❌ ERROR MESSAGE:',
				err?.message
			)

			console.error(
				'❌ ERROR NAME:',
				err?.name
			)

			console.error(
				'❌ ERROR CODE:',
				err?.code
			)

			console.error(
				'❌ ERROR STACK:',
				err?.stack
			)

			// Axios response
			if (err?.response) {
				console.error(
					'📡 RESPONSE:',
					err.response
				)

				console.error(
					'📊 STATUS:',
					err.response.status
				)

				console.error(
					'📊 STATUS TEXT:',
					err.response.statusText
				)

				console.error(
					'📥 BACKEND DATA:',
					err.response.data
				)

				console.error(
					'📋 BACKEND JSON:',
					JSON.stringify(
						err.response.data,
						null,
						2
					)
				)

				console.error(
					'📨 RESPONSE HEADERS:',
					err.response.headers
				)
			}

			// Request
			if (err?.request) {
				console.error(
					'📤 REQUEST:',
					err.request
				)
			}

			// Yuborilgan DATA
			console.error(
				'📦 YUBORILGAN ORDER DATA:',
				orderData
			)

			console.error(
				'📋 YUBORILGAN JSON:',
				JSON.stringify(
					orderData,
					null,
					2
				)
			)

			console.groupEnd()

			setShowErrorModal(true)
			setShowPaymentModal(false)

			const backendMessage =
				Array.isArray(
					err?.response?.data
						?.errorMessage
				)
					? err.response.data.errorMessage.join(
							'; '
					  )
					: err?.response?.data
							?.errorMessage

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
		<div className='px-3 xl:px-10 py-24'>
			<h2 className='text-3xl font-bold'>Savat</h2>

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
									src={
										item.image ||
										noImage
									}
									alt={
										(item.name || '')
											.length >
										20
											? (item.name ||
													''
											  ).slice(
													0,
													20
											  ) + '…'
											: item.name ||
											  ''
									}
									className='w-full aspect-square object-contain rounded-xl'
								/>
							</div>

							<div className='w-2/3'>
								<p className='text-sm font-bold text-black h-[40px] max-h-[40px] dark:text-white'>
									{(
										item.name ||
										''
									).length > 48
										? (
												item.name ||
												''
										  ).slice(
												0,
												48
										  ) + '…'
										: item.name ||
										  ''}
								</p>

								<div className='flex items-end justify-between'>
									<div className='w-full'>
										<div className='flex items-center justify-between w-full'>
											<p className='text-sm font-bold mt-1 text-[rgb(165,150,225)]'>
												{item.price !=
												null
													? `${Number(
															item.price
													  )
															.toLocaleString(
																'fr-FR',
																{
																	maximumFractionDigits: 4,
																}
															)
															.replace(
																/\s/g,
																' '
															)} so'm`
													: 'Narx belgilanmagan'}
											</p>

											<div className='flex justify-between items-center gap-2 mt-2'>
												<button
													onClick={() => {
														const newCount =
															(counts[
																item
																	.productId
															]
																?.count ||
																0) -
															1

														if (
															newCount <=
															0
														) {
															const updatedBasket =
																basket.filter(
																	b =>
																		b.productId !==
																		item.productId
																)

															setBasket(
																updatedBasket
															)

															updateQuantity(
																item,
																0
															)
														} else {
															updateQuantity(
																item,
																newCount
															)
														}
													}}
													className='px-2 bg-[rgb(141,119,229)] rounded text-white dark:bg-opacity-50'
												>
													−
												</button>

												<button
													onClick={() =>
														updateQuantity(
															item,
															(counts[
																item
																	.productId
															]
																?.count ||
																0) +
																1
														)
													}
													className='px-2 bg-[rgb(141,119,229)] rounded text-white dark:bg-opacity-50'
												>
													+
												</button>
											</div>
										</div>

										<div className='flex justify-between w-full'>
											<p className='text-gray-500 mt-1 text-sm dark:text-gray-300'>
												Miqdori:{' '}
												<span className='text-[rgb(165,150,255)]'>
													{counts[
														item
															.productId
													]
														?.count ||
														0}
												</span>
											</p>

											<p className='text-gray-500 mt-1 text-sm dark:text-gray-300'>
												Summa:{' '}
												{item.price !=
												null
													? Number(
															(counts[
																item
																	.productId
															]
																?.count ||
																0) *
																item.price
													  )
															.toLocaleString(
																'fr-FR',
																{
																	maximumFractionDigits: 4,
																}
															)
															.replace(
																/\s/g,
																' '
															)
													: 'Narx belgilanmagan'}
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
				<button
					onClick={() =>
						setShowCommentModal(true)
					}
					className='bg-[rgb(141,119,229)] w-80 py-2 text-white mx-auto rounded-md fixed bottom-20 right-0 left-0'
				>
					Buyurtma berish
				</button>
			)}

			<CommentModal
				showCommentModal={showCommentModal}
				setShowCommentModal={
					setShowCommentModal
				}
				comment={comment}
				setComment={setComment}
				setShowPaymentModal={
					setShowPaymentModal
				}
				basket={basket}
				counts={counts}
			/>

			<PaymentModal
				showPaymentModal={
					showPaymentModal
				}
				setShowPaymentModal={
					setShowPaymentModal
				}
				handleConfirmOrder={
					handleConfirmOrder
				}
			/>

			{showErrorModal && (
				<ErrorModal
					setShowErrorModal={
						setShowErrorModal
					}
				/>
			)}
		</div>
	)
}

export default Basket
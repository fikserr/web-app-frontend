import { useEffect, useState } from 'react'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import RegisterBanner from '../components/RegisterBanner'
import { Button } from '../components/ui/button'
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '../components/ui/pagination'
import useOrderList from '../hooks/useOrderList'
import { getUserId } from '../lib/auth'
import nothingFound from '../icons/nothingFound.gif'

// backend "DD.MM.YYYY HH:MM:SS" formatida sana yuboradi — new Date() buni ishonchli parse qilolmaydi
const parseOrderDate = value => {
	if (!value) return null
	const match = /^(\d{2})\.(\d{2})\.(\d{4})[ T](\d{1,2}):(\d{2}):(\d{2})$/.exec(value)
	if (match) {
		const [, day, month, year, hour, minute, second] = match
		return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
	}
	const fallback = new Date(value)
	return Number.isNaN(fallback.getTime()) ? null : fallback
}

const OrderList = () => {
	const [page, setPage] = useState(1)
	const pageSize = 20
	const userId = getUserId()

	const { orders, loading, error, meta } = useOrderList(
		userId,
		page,
		pageSize
	)
	const [expandedOrders, setExpandedOrders] = useState({})

	const toggleProducts = orderId => {
		setExpandedOrders(prev => ({
			...prev,
			[orderId]: !prev[orderId],
		}))
	}

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}, [page])

	if (loading)
		return (
			<div className='w-full fixed top-0 left-0 pt-16'>
				<RegisterBanner
					registered={false}
					loading={loading}
					pageText={'Buyurtmalaringizni ko‘rish uchun'}
				/>
			</div>
		)
	if (error)
		return (
			<div className='w-full fixed top-0 left-0 pt-16'>
				<RegisterBanner
					registered={false}
					pageText='Buyurtmalarni ko‘rish uchun qayta urinib ko‘ring.'
				/>
			</div>
		)

	const totalPages = Number(meta?.lastPage) || 1

	// Build visible pages: current, current+1, lastPage
	const pagesToShow = [page]
	if (page + 1 <= totalPages) pagesToShow.push(page + 1)
	if (page + 1 < totalPages - 1) pagesToShow.push('ellipsis')
	if (totalPages > 1 && !pagesToShow.includes(totalPages))
		pagesToShow.push(totalPages)

	return (
		<div className={`my-20 px-3`}>
			{orders.length > 0 ? (
				orders.map(order => {
					const orderId = order.UUID ?? order.Id ?? order.id ?? order.orderId ?? order.code ?? order.number
					const productList = Array.isArray(order.productList)
						? order.productList
						: Array.isArray(order.products)
							? order.products
							: []
					const orderTotal = Number(order.totalSum ?? order.totalVal ?? order.total ?? order.sum ?? order.amount ?? 0)
					const currency = order.currencyName ?? (order.totalSum ? 'UZS' : 'USD')
					const statusLabel =
						order.status && typeof order.status === 'object'
							? order.status.name ?? order.status.id ?? 'Noma’lum'
							: order.status ?? 'Noma’lum'
					const orderDate = parseOrderDate(order.date)

					return (
						<div
							key={orderId}
							className='border rounded-lg p-4 shadow bg-white space-y-2 dark:bg-gray-800 mb-3'
						>
							<div className='flex justify-between items-center'>
								<div>
									<p>
										<strong>№ {order.code ?? order.number ?? order.orderNumber ?? orderId}</strong>
									</p>
									<p>
										Summa:{' '}
										{orderTotal
											.toLocaleString('fr-FR', {
												maximumFractionDigits: 4,
											})
											.replace(/\s/g, ' ')}{' '}
										{currency}
									</p>
									<p>
										Sana:{' '}
										{orderDate ? orderDate.toLocaleString() : '—'}
									</p>
									<p className='text-gray-950 dark:text-gray-300'>
										Status: {statusLabel}
									</p>
								</div>
								<button
									onClick={() => toggleProducts(orderId)}
									className='px-2 py-2 rounded text-xl'
								>
									{expandedOrders[orderId] ? <FaCaretUp /> : <FaCaretDown />}
								</button>
							</div>

							{expandedOrders[orderId] && (
								<div className='mt-3 space-y-2'>
									{productList.length > 0 ? (
										productList.map((product, index) => (
											<div
												key={product.productId ?? product.product_id ?? `${orderId}-${index}`}
												className='border rounded p-2 bg-gray-50 flex items-center gap-3 dark:bg-gray-700'
											>
												<div>
													<p className='font-medium h-[50px] max-h-[50px]'>
														{product.productName ?? product.name ?? 'Mahsulot'}
													</p>
													<p className='text-sm text-gray-600 dark:text-gray-300'>
														{product.quantity ?? 0} {product.measurName ?? product.measureName ?? ''} ×{' '}
														{product.price ?? 0} {product.currencyName ?? product.currency ?? ''}
													</p>
												</div>
											</div>
										))
									) : (
										<p className='text-sm text-gray-500'>Mahsulotlar mavjud emas</p>
									)}
								</div>
							)}
						</div>
					)
				})
			) : (
				<div className='w-full h-full flex flex-col gap-0 items-center justify-center fixed top-0 left-0 overflow-hidden hide-scrollbar'>
					<img src={nothingFound} className='w-[300px]' />
					<h2 className='text-3xl font-semibold mb-2'>Hech nima topilmadi</h2>
					<p className='mb-2 text-xl dark:text-gray-400'>
						Avval mahsulot harid qiling
					</p>
					<Link to={'/'}>
						<Button>Kategoriyalar</Button>
					</Link>
				</div>
			)}

			{/* Pagination */}
			{orders.length > 0 && totalPages > 1 && (
				<div className='flex justify-center mt-6'>
					<Pagination>
						<PaginationContent className='flex items-center gap-1'>
							{/* Previous */}
							<PaginationItem>
								<PaginationPrevious
									href='#'
									onClick={e => {
										e.preventDefault()
										setPage(prev => Math.max(1, prev - 1))
									}}
									className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
								/>
							</PaginationItem>

							{/* Page Numbers */}
							{pagesToShow.map((p, index) => {
								if (p === 'ellipsis') {
									return (
										<PaginationItem key={`ellipsis-${index}`}>
											<PaginationEllipsis />
										</PaginationItem>
									)
								}

								return (
									<PaginationItem key={p}>
										<PaginationLink
											href='#'
											isActive={p === page}
											onClick={e => {
												e.preventDefault()
												setPage(p)
											}}
										>
											{p}
										</PaginationLink>
									</PaginationItem>
								)
							})}

							{/* Next */}
							<PaginationItem>
								<PaginationNext
									href='#'
									onClick={e => {
										e.preventDefault()
										setPage(prev => Math.min(totalPages, prev + 1))
									}}
									className={
										page >= totalPages ? 'pointer-events-none opacity-50' : ''
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}
		</div>
	)
}

export default OrderList

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
import nothingFound from '../icons/nothingFound.gif'

const OrderList = () => {
	const [page, setPage] = useState(1)
	const pageSize = 5
	const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
	// const tgUser = { id: 1284897972 }

	const { orders, loading, error, meta } = useOrderList(
		tgUser?.id,
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
	if (!tgUser || !tgUser.id)
		return (
			<div className='w-full fixed top-0 left-0 pt-16'>
				<RegisterBanner
					registered={false}
					pageText={'Buyurtmalaringizni ko‘rish uchun'}
				/>
			</div>
		)
	if (loading) return <p>Yuklanmoqda...</p>
	if (error) return <p className='text-red-500'>Xatolik: {error}</p>

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
				orders.map(order => (
					<div
						key={order.Id}
						className='border rounded-lg p-4 shadow bg-white space-y-2 dark:bg-gray-800 mb-3'
					>
						<div className='flex justify-between items-center'>
							<div>
								<p>
									<strong>№ {order.number}</strong>
								</p>
								<p>
									Summa: {order.totalSum ? order.totalSum : order.totalVal}
									{order.totalSum ? ' UZS' : ' USD'}{' '}
								</p>
								<p>Sana: {new Date(order.date).toLocaleString()}</p>
								<p className='text-gray-950 dark:text-gray-300'>
									Status: {order.status}
								</p>
							</div>
							<button
								onClick={() => toggleProducts(order.Id)}
								className='px-2 py-2 rounded text-xl'
							>
								{expandedOrders[order.Id] ? <FaCaretUp /> : <FaCaretDown />}
							</button>
						</div>

						{expandedOrders[order.Id] && (
							<div className='mt-3 space-y-2'>
								{order.productList.map(product => (
									<div
										key={product.productId}
										className='border rounded p-2 bg-gray-50 flex items-center gap-3 dark:bg-gray-700'
									>
										<div>
											<p className='font-medium h-[50px] max-h-[50px]'>
												{product.productName}
											</p>
											<p className='text-sm text-gray-600 dark:text-gray-300'>
												{product.quantity} {product.measurName} ×{' '}
												{product.price} {product.currencyName}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				))
			) : (
				<div className='w-full h-screen flex flex-col gap-0 items-center justify-center absolute top-20'>
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

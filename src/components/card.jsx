import { useState } from 'react'
import NoImage from '../assets/no-photo.jpg'
import { Skeleton } from './ui/skeleton'

const Card = ({ product, productInCart, onUpdate, loading }) => {
	const [isModalOpen, setIsModalOpen] = useState(false)

	if (loading) {
		return (
			<div className='flex flex-col justify-between rounded-lg overflow-hidden p-2'>
				<Skeleton className='h-36 w-full rounded-xl' />
				<div>
					<Skeleton className='h-4 w-3/4 mt-2' />
					<Skeleton className='h-4 w-1/2 mt-1' />
				</div>
				<div className='pt-2'>
					<Skeleton className='h-4 w-1/3' />
				</div>
			</div>
		)
	}

	return (
		<>
			<div className='flex flex-col justify-between rounded-lg overflow-hidden p-2'>
				<img
					src={product.imageUrl || NoImage}
					alt={product.name}
					className='w-full h-36 object-cover rounded-xl cursor-pointer'
					onClick={() => setIsModalOpen(true)}
				/>

				<div>
					<h3 className='text-sm font-semibold mt-2'>{product.name}</h3>
				</div>

				<div className='pt-2'>
					<p className='text-xs font-bold text-emerald-700'>
						{product.prices?.[0]?.price} {product.prices?.[0]?.currencyname}
					</p>

					{productInCart ? (
						<div className='flex justify-between items-center gap-2 mt-2'>
							<button
								onClick={() => onUpdate(product, productInCart.count - 1)}
								className='px-3 py-1 bg-[rgb(22,113,98)] rounded text-base text-white'
							>
								−
							</button>

							<input
								type='number'
								min='0'
								value={productInCart.count}
								onChange={e => onUpdate(product, Number(e.target.value))}
								title='Miqdor'
								className='w-16 text-center border rounded py-1 dark:text-white dark:bg-gray-800'
							/>

							<button
								onClick={() => onUpdate(product, productInCart.count + 1)}
								className='px-3 py-1 bg-[rgb(22,113,98)] rounded text-white'
							>
								+
							</button>
						</div>
					) : (
						<div className="flex justify-end' title='Savatga qo'shish">
							<button
								onClick={() => onUpdate(product, 1)}
								className='px-3 py-1 mt-2 bg-[rgb(22,113,98)] rounded text-white w-full'
							>
								Savatga qo'shish
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Modal */}
			{isModalOpen && (
				<div
					onClick={() => setIsModalOpen(false)}
					className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50'
				>
					<div
						className='relative max-w-2xl w-full p-4'
						onClick={e => e.stopPropagation()}
					>
						<button
							onClick={() => setIsModalOpen(false)}
							className='absolute top-5 right-8 text-2xl'
						>
							✕
						</button>
						<img
							src={product.imageUrl || NoImage}
							alt={product.name}
							className='w-full max-h-[80vh] object-contain rounded-lg'
						/>
					</div>
				</div>
			)}
		</>
	)
}

export default Card

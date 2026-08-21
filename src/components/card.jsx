import NoImage from '../assets/no-photo.jpg'
import { resolveDisplayPrice } from '../lib/pricing'
import { Skeleton } from './ui/skeleton'
import { useNavigate } from 'react-router-dom'
import useAppConfig from '../hooks/useAppConfig'

const Card = ({ product, productInCart, onUpdate, loading, registered }) => {
	const navigate = useNavigate()
	// re-renders once the USD→UZS rate arrives from /config, so products priced only in
	// USD (see lib/pricing.js) pick up the live rate instead of staying on the fallback
	useAppConfig()
	const displayPrice = loading ? null : resolveDisplayPrice(product)
	// pass the already-fetched product (from /catalogs/products/full, so it already has
	// everything — description included) via navigation state, so the detail page doesn't
	// need to re-fetch it from a separate endpoint
	const goToDetail = () => navigate(`/detail/${product.id}`, { state: { product } })

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
		<div className='flex flex-col justify-between rounded-lg overflow-hidden p-2'>
			<img
				src={product.imageUrl ? product.imageUrl : NoImage}
				alt={
					(product.name || '').length > 50
						? (product.name || '').slice(0, 50) + '…'
						: (product.name || '')
				}
				className='w-full h-36 object-contain rounded-xl cursor-pointer'
				onClick={goToDetail}
			/>

			<div onClick={goToDetail} className='cursor-pointer'>
				<h3
					className={`h-10 text-sm flex font-semibold mt-2 ${
						registered ? ' items-center ' : 'items-start'
					} `}
				>
					{(product.name || '').length > 20
						? (product.name || '').slice(0, 20) + '…'
						: (product.name || '')}
				</h3>
			</div>

			<div className='pt-2'>
				{registered ? (
					<p className='text-xs font-bold dark:text-white'>
						{displayPrice.price != null
							? `${displayPrice.price
									.toLocaleString('fr-FR', { maximumFractionDigits: 4 })
									.replace(/\s/g, ' ')} ${displayPrice.currency.name}`
							: 'Narx belgilanmagan'}
					</p>
				) : null}

				{productInCart ? (
					<div className='flex justify-between items-center gap-2 mt-2'>
						<button
							onClick={() => onUpdate(product, productInCart.count - 1)}
							className='px-3 py-1 bg-[rgb(141,119,229)] rounded text-base text-white'
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
							className='px-3 py-1 bg-[rgb(141,119,229)] rounded text-white'
						>
							+
						</button>
					</div>
				) : (
					<div className="flex justify-end" title="Savatga qo'shish">
						<button
							disabled={!registered || displayPrice.price == null}
							onClick={() => onUpdate(product, 1)}
							className='px-3 py-1 mt-2 bg-[rgb(141,119,229)] disabled:bg-[rgb(79,72,134)] rounded text-black dark:text-white w-full'
						>
							Savatga qo'shish
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default Card

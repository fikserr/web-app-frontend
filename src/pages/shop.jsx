import { useEffect, useMemo, useState } from 'react'
import { IoIosCloseCircleOutline, IoMdSearch } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'
import Card from '../components/card'
import { Button } from '../components/ui/button'
import useAddBasket from '../hooks/useAddBasket'
import useProducts from '../hooks/useProducts'
import nothingFound from '../icons/nothingFound.gif'

const Shop = () => {
	// const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
	const tgUser = { id: 1284897972 }
	const navigate = useNavigate()
	const [selectedCategory, setSelectedCategory] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')

	// ✅ LocalStorage dan category ma’lumotini olish
	useEffect(() => {
		const storedCategory = localStorage.getItem('selectedCategory')
		if (storedCategory) {
			setSelectedCategory(JSON.parse(storedCategory))
			// console.log('Loaded category from storage:', JSON.parse(storedCategory))
		}
	}, [])

	const {
		products,
		loading: productsLoading,
		error: productsError,
	} = useProducts({
		page: 1,
		pageSize: 4,
		userId: tgUser?.id,
		categoryId: selectedCategory?.Id,
	})

	const { counts, updateQuantity } = useAddBasket(tgUser?.id)

	const filteredProducts = useMemo(() => {
		if (!Array.isArray(products)) return []
		if (!searchTerm.trim()) return products
		return products.filter(p =>
			(p?.Name || p?.name || '')
				.toLowerCase()
				.includes(searchTerm.toLowerCase())
		)
	}, [products, searchTerm])

	return (
		<div className='py-24 px-2 mb-16 xl:px-10'>
			<div className='flex items-center md:max-w-lg border justify-between p-2 rounded-xl px-5 mb-6'>
				<input
					type='text'
					placeholder='Qidiruv...'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					className='text-lg w-full outline-none px-3 bg-transparent text-gray-800 placeholder-gray-500 focus:border-[rgb(22,113,98)] focus:ring-0 dark:text-white'
				/>
				{searchTerm ? (
					<IoIosCloseCircleOutline
						className='text-2xl text-red-500 cursor-pointer'
						onClick={() => setSearchTerm('')}
					/>
				) : (
					<IoMdSearch className='text-2xl' />
				)}
			</div>

			{/* ✅ Tanlangan kategoriya nomi chiqadi */}

			<div className='my-5'>
				{selectedCategory && (
					<div className='mb-6'>
						<h2 className='font-bold text-2xl max-h-[64px]'>
							{selectedCategory.name}
						</h2>
					</div>
				)}
				{productsError && <p>Xato: {productsError}</p>}
				{!productsLoading &&
					searchTerm.length <= 0 &&
					products.length === 0 && (
						<div className='flex flex-col items-center justify-center w-full my-20 gap-4'>
							<p className='text-center font-semibold text-base w-[260px]'>
								Bu kategoriyada mahsulotlar yo'q !
							</p>
							<Button onClick={() => navigate('/')}>
								Boshqa kategoriyani Tanlash
							</Button>
						</div>
					)}

				{filteredProducts.length > 0 ? (
					<div className='grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4'>
						{productsLoading
							? Array.from({ length: 6 }).map((_, i) => (
									<Card key={i} loading={true} />
							  ))
							: filteredProducts.map(p => (
									<Card
										key={p.Id}
										product={p}
										productInCart={counts[p.Id]}
										onUpdate={updateQuantity}
										loading={false}
									/>
							  ))}
					</div>
				) : (
					searchTerm && (
						<div className='w-full h-[400px] flex flex-col gap-0 items-center justify-center'>
							<img src={nothingFound} className='w-[300px]' />
							<h2 className='text-3xl font-semibold mb-2'>
								Hech nima topilmadi
							</h2>
							<p className='text-lg text-center font-medium text-gray-600'>
								Qidiruv so'zini o'zgartirib <br /> ko'ring
							</p>
						</div>
					)
				)}
			</div>
		</div>
	)
}

export default Shop

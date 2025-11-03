import { useEffect, useState } from 'react'
import { IoIosCloseCircleOutline, IoMdSearch } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'
import nothingFound from '../icons/nothingFound.gif'
import noImage from '../assets/no-photo.jpg'
import { Skeleton } from '../components/ui/skeleton'
import useCategories from '../hooks/useCategories'

const Categories = () => {
	const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
	// const tgUser = { id: 339299758 }

	const {
		categories,
		meta,
		loading: categoriesLoading,
		error: categoriesError,
	} = useCategories(tgUser?.id, 1, 10)

	const [cat, setCat] = useState([])
	const [searchTerm, setSearchTerm] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		if (categories && categories.length > 0) {
			setCat(
				categories.map((c, index) => ({
					...c,
					active: index === 0,
				}))
			)
		}
	}, [categories])

	const filteredCategories = cat.filter(category =>
		category.name.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const handleCategoryClick = id => {
		const selectedCategory = filteredCategories.find(c => c.Id === id)
		navigate('/shop')
		localStorage.setItem('selectedCategory', JSON.stringify(selectedCategory))
		setCat(prev =>
			prev.map(c => ({
				...c,
				active: c.Id === selectedCategory.Id,
			}))
		)
	}

	return (
		<div className='px-2 mb-40 mt-24'>
			{/* Search Bar */}
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

			{/* Title */}
			<div className='mb-5 px-2'>
				<h2 className='text-2xl font-semibold h-8 max-h-8'>Kategoriyalar</h2>
			</div>

			{/* Conditional rendering */}
			{categoriesLoading ? (
				// 🔹 Skeleton Loader
				<div className='grid grid-cols-3 sm:grid-cols-4 justify-around gap-4'>
					{Array.from({ length: 8 }).map((_, idx) => (
						<div
							key={idx}
							className='flex flex-col items-center justify-center text-center'
						>
							<Skeleton className='w-24 h-24 rounded-xl mb-2' />
							<Skeleton className='h-4 w-20' />
						</div>
					))}
				</div>
			) : filteredCategories.length > 0 ? (
				// 🔹 Real Categories
				<div className='grid grid-cols-3 sm:grid-cols-4 justify-around gap-4'>
					{filteredCategories.map(c => (
						<div
							key={c.Id}
							onClick={() => handleCategoryClick(c.Id)}
							className='cursor-pointer flex flex-col items-center justify-center text-center transition-all'
						>
							<div className='w-24 h-24 rounded-xl flex items-center justify-center mb-2 shadow-md overflow-hidden border-2 transition-all'>
								<img
									src={c.imageUrl || noImage}
									alt={c.title}
									className='w-full h-full object-cover'
								/>
							</div>
							<p className='text-sm font-medium h-[40px] max-h-[40px] overflow-auto'>
								{c.name.length > 20 ? c.name.slice(0, 30) + '...' : c.name}
							</p>
						</div>
					))}
				</div>
			) : !categoriesLoading && !categoriesError ? (
				// 🔹 No Results — only after loading completes

				<div className='w-full h-[400px] flex flex-col gap-0 items-center justify-center'>
					<img src={nothingFound} className='w-[300px]' />
					<h2 className='text-3xl font-semibold mb-2'>Hech nima topilmadi</h2>
					<p className='text-lg text-center font-medium text-gray-600'>
						Qidiruv so'zini o'zgartirib <br /> ko'ring
					</p>
				</div>
			) : null}
		</div>
	)
}

export default Categories

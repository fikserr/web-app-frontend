import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useCategories from '../hooks/useCategories'

const Categories = () => {
	const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
	const {
		categories,
		meta,
		loading: categoriesLoading,
		error: categoriesError,
	} = useCategories(tgUser?.id, 1, 10)

	const [cat, setCat] = useState([])

	// Kategoriyalar yuklanganda birinchi kategoriya active bo‘ladi
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

	const handleCategoryClick = index => {
		const selectedCategory = cat[index]
		// console.log('selected category info:', selectedCategory)

		// ✅ LocalStorage ga saqlash
		localStorage.setItem('selectedCategory', JSON.stringify(selectedCategory))

		// ✅ Faqat bitta category active bo‘lishi uchun
		setCat(prev =>
			prev.map((c, i) => ({
				...c,
				active: i === index,
			}))
		)
	}

	return (
		<div className='px-2 mb-40 mt-24'>
			<div className='grid grid-cols-3 sm:grid-cols-4 justify-around gap-4'>
				{cat.map((c, index) => (
					<div
						key={index}
						onClick={() => handleCategoryClick(index)}
						className={`cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
							c.active
								? 'text-[rgb(22,113,98)] dark:text-white'
								: 'text-gray-800 dark:text-gray-500'
						}`}
					>
						<div
							className={`w-24 h-24 rounded-xl flex items-center justify-center mb-2 shadow-md overflow-hidden border-2 transition-all ${
								c.active
									? 'border-green-500 bg-gray-800 dark:border-white'
									: 'border-transparent bg-gray-100 dark:bg-gray-800'
							}`}
						>
							<img
								src={c.imageUrl || '/src/assets/no-photo.jpg'}
								alt={c.title}
								className='w-full h-full object-cover'
							/>
						</div>
						<p className='text-sm font-medium h-[40px] max-h-[40px]'>
							{c.name.length > 20 ? c.name.slice(0, 30) + '...' : c.name}
						</p>
					</div>
				))}
			</div>

			<Link
				to={'/shop'}
				className='bg-[rgb(22,113,98)] w-full text-center py-2 text-white rounded-md fixed bottom-0 right-0 left-0'
			>
				Tanlash
			</Link>
		</div>
	)
}

export default Categories

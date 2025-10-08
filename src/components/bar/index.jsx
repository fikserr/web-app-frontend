import { useEffect, useState } from 'react'
import { FiShoppingBag } from 'react-icons/fi'
import { GiShop } from 'react-icons/gi'
import { IoFileTrayFull } from 'react-icons/io5'
import { Link, useLocation } from 'react-router-dom'
import HandHoldBox from '../../icons/HandHoldBox'
const Bar = () => {
	const location = useLocation()
	const currentPath = location.pathname
	const [productCount, setProductCount] = useState(0)

	useEffect(() => {
		// 🔄 Read from localStorage every 1s — super light
		const interval = setInterval(() => {
			const stored = JSON.parse(localStorage.getItem('basket_counts')) || {}
			setProductCount(Object.keys(stored).length)
		}, 1000)

		return () => clearInterval(interval)
	}, [])

	const linkClass = path =>
		`flex flex-col items-center ${
			currentPath === path
				? 'text-emerald-600'
				: 'text-gray-700 dark:text-gray-400'
		}`

	return (
		<div className='fixed bottom-0 left-0 right-0 z-50 w-full border-t-2 border-slate-300 bg-white dark:bg-gray-800 dark:border-gray-800 shadow-md'>
			<div className='flex items-center justify-evenly my-3'>
				<Link to='/' className={linkClass('/')}>
					<GiShop style={{ fontSize: '25px' }} />
					<span>Kategoriyalar</span>
				</Link>

				<Link to='/basket' className={`${linkClass('/basket')} relative`}>
					<FiShoppingBag style={{ fontSize: '25px' }} />
					<span>Savat</span>

					{productCount > 0 && (
						<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full'>
							{productCount}
						</span>
					)}
				</Link>

				<Link to='/orderList' className={`${linkClass('/orderList') }`}>
					<HandHoldBox size={26} className="text-black dark:text-white" />
					<span>Buyurtmalar</span>
				</Link>

				<Link to='/report' className={linkClass('/report')}>
					<IoFileTrayFull style={{ fontSize: '25px' }} />
					<span>Hisobot</span>
				</Link>
			</div>
		</div>
	)
}

export default Bar

import { IoArrowBack } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

// Navbar (header/index.jsx) ichida emas — alohida suzuvchi tugma sifatida,
// header pastida, har bir sahifada ko'rinadi va doim bitta qadam orqaga qaytaradi
const BackButton = () => {
	const navigate = useNavigate()

	return (
		<button
			onClick={() => navigate(-1)}
			aria-label='Orqaga'
			className='fixed top-20 left-3 z-40 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md text-gray-900 dark:text-gray-100 hover:opacity-80 transition'
		>
			<IoArrowBack style={{ fontSize: '20px' }} />
		</button>
	)
}

export default BackButton

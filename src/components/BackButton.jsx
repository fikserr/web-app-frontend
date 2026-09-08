import { IoArrowBack } from 'react-icons/io5'
import { useLocation, useNavigate } from 'react-router-dom'

// Categoriyalar ('/') va Home ('/home') — ilovaning kirish nuqtalari, bu yerda
// "orqaga" mantiqiy emas, shuning uchun bu ikki sahifada yashiriladi
const HIDDEN_ROUTES = ['/', '/home']

// Navbar (header/index.jsx) ichida emas — chap past burchakda, bottom bar
// (components/bar) ustida suzuvchi tugma sifatida, doim bitta qadam orqaga qaytaradi
const BackButton = () => {
	const navigate = useNavigate()
	const location = useLocation()

	if (HIDDEN_ROUTES.includes(location.pathname)) return null

	return (
		<button
			onClick={() => navigate(-1)}
			aria-label='Orqaga'
			className='fixed bottom-20 left-3 z-40 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md text-gray-900 dark:text-gray-100 hover:opacity-80 transition'
		>
			<IoArrowBack style={{ fontSize: '20px' }} />
		</button>
	)
}

export default BackButton

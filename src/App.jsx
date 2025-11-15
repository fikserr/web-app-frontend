import { Outlet, useLocation } from 'react-router-dom'
import Bar from './components/bar'
import Header from './components/header'
import { Toaster } from './components/ui/sonner'

const App = () => {
	const location = useLocation()
	const hideBarRoutes = ['/detail']
	const shouldHideBar = hideBarRoutes.some(path =>
		location.pathname.startsWith(path)
	)
	// const tg = window.Telegram?.WebApp;
	// tg?.ready();

	return (
		<div className='min-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300'>
			<Header />
			<main className=''>
				<Outlet />
			</main>
			<Toaster position='top-center' />
			{!shouldHideBar && <Bar />}
		</div>
	)
}

export default App

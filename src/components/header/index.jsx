import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { IoHome } from 'react-icons/io5'
import { Link } from 'react-router-dom'
import Logo from '../../assets/Logo.png'
import LogoDark from '../../assets/LogoDark.png'
import LogoLight from '../../assets/LogoLight.png'

const Header = () => {
	const tg = window.Telegram?.WebApp // optional chaining bilan

	const [theme, setTheme] = useState(
		localStorage.getItem('theme') || (tg ? tg.colorScheme : 'light')
	)

	useEffect(() => {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
		localStorage.setItem('theme', theme)
	}, [theme])

	useEffect(() => {
		if (!tg) return

		const handleThemeChange = () => {
			setTheme(tg.colorScheme)
		}

		tg.onEvent('themeChanged', handleThemeChange)

		return () => {
			tg.offEvent('themeChanged', handleThemeChange)
		}
	}, [tg])

	return (
		<div className='px-5 xl:px-10 h-16 py-1 dark:bg-gray-800 text-gray-900 bg-white dark:text-gray-100 shadow-md fixed w-full top-0 z-50 '>
			<div className='my-3 flex items-center justify-between'>
				<img src={theme == "dark" ? LogoLight : LogoDark} alt='Logo' className='h-9 w-32 aspect-auto   dark:shadow-md' />
				<div className='flex items-center gap-5'>
					<Link to={'/home'}>
						<IoHome style={{ fontSize: '25px' }} />
					</Link>

					<button
						onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
						className='p-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:opacity-80 transition'
					>
						{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
					</button>
				</div>
			</div>
		</div>
	)
}

export default Header

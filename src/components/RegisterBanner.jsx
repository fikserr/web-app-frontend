import { Skeleton } from '@/components/ui/skeleton'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

function RegisterBanner({ registered, pageText, loading , userId }) {
	const isLoading =
		registered === null || registered === undefined || loading === true
	const isRegistered = registered === true || !userId === null || !userId === undefined
	const textRef = useRef(null)
	const isMobile = useMediaQuery('(max-width: 768px)')

	// Only run GSAP when NOT registered and NOT loading
	useEffect(() => {
		if (isRegistered) return

		const textEl = textRef.current
		if (!textEl) return

		const originalText = pageText
			? pageText +
			` <span class="font-bold ml-0 md:ml-1"> ro'yxatdan o'ting !</span>`
			: `Narxlarni ko'rish va Buyurtma berish uchun <span class="font-bold ml-0 md:ml-1"> ro'yxatdan o'ting !</span>`

		if (!isMobile) {
			textEl.innerHTML = originalText
			gsap.killTweensOf(textEl)
			gsap.set(textEl, { x: 0 })
			return
		}

		textEl.innerHTML = `
      <span class="mr-16 inline-block">${originalText}</span>
      <span class="mr-16 inline-block">${originalText}</span>
    `
		const width = textEl.offsetWidth / 2

		const tl = gsap.to(textEl, {
			x: -width,
			duration: 15,
			ease: 'linear',
			repeat: -1,
		})

		return () => tl.kill()
	}, [isRegistered, isMobile, isLoading])

	if (isLoading) {
		return (
			<div className='sticky z-50 top-16 w-full py-2 px-2 flex justify-center'>
				<Skeleton className='h-8 rounded-md w-full ' />
			</div>
		)
	}

	// --------------------
	// 2) Already registered → hide
	// --------------------
	if (isRegistered) return null

	return (
		<div className='sticky z-50 top-16 text-sm xl:text-lg w-full bg-[#a791ff] overflow-hidden flex items-center md:justify-center py-2 xl:py-1 font-normal'>
			<p
				ref={textRef}
				className='text-center text-black dark:text-[#43348a] font-medium px-4 flex items-center whitespace-nowrap'
			>
				Narxlarni ko'rish va Buyurtma berish uchun
				<span className='font-bold ml-1'>ro'yxatdan o'ting !</span>
			</p>
		</div>
	)
}

export default RegisterBanner

import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery' // ⬅ import hook

function RegisterBanner({ registered, pageText }) {
	const isRegistered = registered == true ? registered : false // false  for testing
	const textRef = useRef(null)

	// Live detection (updates instantly on resize)
	const isMobile = useMediaQuery('(max-width: 768px)')

	useEffect(() => {
		if (!isRegistered && textRef.current) {
			const textEl = textRef.current
			const originalText = pageText
				? pageText +
				` <span class="font-bold ml-0 md:ml-1"> ro'yxatdan o'ting !</span>`
				: `Narxlarni ko'rish va Buyurtma berish uchun` +
				` <span class="font-bold ml-0 md:ml-1"> ro'yxatdan o'ting !</span>`

			// ---- DESKTOP/TABLET MODE ----
			if (!isMobile) {
				textEl.innerHTML = originalText // restore original text
				gsap.killTweensOf(textEl) // stop GSAP animation
				gsap.set(textEl, { x: 0 }) // reset position
				return
			}

			// ---- MOBILE MODE (ANIMATE) ----
			textEl.innerHTML = `
        <span class="mr-16 inline-block">${originalText}</span>
        <span class="mr-16 inline-block">${originalText}</span>
      `

			const textWidth = textEl.offsetWidth / 2

			const tl = gsap.to(textEl, {
				x: -textWidth,
				duration: 15,
				ease: 'linear',
				repeat: -1,
			})

			return () => tl.kill()
		}
	}, [isRegistered, isMobile])

	return !isRegistered ? (
		<div className='sticky z-50 top-16 text-sm xl:text-lg w-full bg-[#a791ff] overflow-hidden flex items-center md:justify-center py-2 xl:py-1 font-normal'>
			<p
				ref={textRef}
				className='
          text-center
          text-black 
					dark:text-[#43348a]
          font-medium 
          px-4 
          flex items-center
          whitespace-nowrap 
        '
			>
				Narxlarni ko'rish va Buyurtma berish uchun
				<span className='font-bold '>ro'yxatdan o'ting !</span>
			</p>
		</div>
	) : null
}

export default RegisterBanner

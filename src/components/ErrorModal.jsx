import { PiWarningCircle } from 'react-icons/pi'
import { useNavigate } from 'react-router-dom'

function ErrorModal({ setShowErrorModal }) {
	const navigate = useNavigate()

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-white rounded-lg p-6 w-80 shadow-lg text-center relative'>
				<PiWarningCircle className='flex justify-center w-full text-4xl text-red-700' />
				<h3 className='text-lg font-semibold my-5 mb-14 text-black'>
					Avval ro'yxatdan o'ting !
				</h3>
				<div className='flex justify-around mt-4'>
					<button
						className='w-full absolute bottom-0 left-0 py-2 border-r-2 border-t-2 text-black'
						onClick={() => {
							setShowErrorModal(false)
							navigate('/')
						}}
					>
						Orqaga
					</button>
				</div>
			</div>
		</div>
	)
}

export default ErrorModal

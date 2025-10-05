import { useState } from 'react'
import useAktSverka from '../hooks/useAktSverka'
import useBalance from '../hooks/useBalance'

// ✅ Shadcn UI
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'

const Report = () => {
	const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
	const { balance, loading, error } = useBalance(tgUser?.id)
	const [dateRange, setDateRange] = useState({
		from: null,
		to: null,
	})

	// Akt sverka uchun state
	const [showAkt, setShowAkt] = useState(false)

	// Hisobotni ko‘rish tugmasi bosilganda hook chaqiladi
	const {
		akt,
		loading: aktLoading,
		error: aktError,
	} = useAktSverka(
		tgUser?.id,
		showAkt && dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
		showAkt && dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null
	)

	if (loading) return <div>Yuklanmoqda...</div>
	if (error) return <div>Xatolik: {error.message}</div>

	return (
		<div className='px-2 xl:px-10 py-24'>
			<h1 className='font-bold text-4xl'>Hisobot</h1>
			{/* Balans */}
			<div className='text-slate-500 my-3'>
				{balance.split('\n').map((line, idx) => (
					<p key={idx}>{line}</p>
				))}
			</div>
			{/* Date Range Picker */}
			<div className='mb-3 flex gap-3'>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant='outline'
							className='w-full justify-start text-left font-normal dark:bg-gray-800 dark:border-white'
						>
							{dateRange.from ? (
								format(dateRange.from, 'dd.MM.yyyy')
							) : (
								<span>Boshlanish sanasi</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className='w-auto p-0' align='start'>
						<Calendar
							mode='single'
							selected={dateRange.from}
							onSelect={date => setDateRange(prev => ({ ...prev, from: date }))}
							numberOfMonths={1}
						/>
					</PopoverContent>
				</Popover>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant='outline'
							className='w-full justify-start text-left font-normal dark:bg-gray-800 dark:border-white'
						>
							{dateRange.to ? (
								format(dateRange.to, 'dd.MM.yyyy')
							) : (
								<span>Tugash sanasi</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className='w-auto p-0' align='start'>
						<Calendar
							mode='single'
							selected={dateRange.to}
							onSelect={date => setDateRange(prev => ({ ...prev, to: date }))}
							numberOfMonths={1}
						/>
					</PopoverContent>
				</Popover>
			</div>
			{/* Hisobotni ko‘rish tugmasi */}
			<Button
				className=' my-1 w-full h-11 max-h-11 bg-emerald-700 text-white'
				disabled={!dateRange.from || !dateRange.to}
				onClick={() => setShowAkt(true)}
			>
				Hisobotni ko‘rish
			</Button>
			{/* Akt Sverka JSON test uchun */}

			{showAkt && akt?.data && (
				<div className='bg-slate-100 p-3 rounded-lg mt-2 mb-10 dark:bg-transparent'>
					<h2 className='font-semibold text-lg mb-3'>To‘lovlar va qarzlar</h2>

					{/* Boshlang‘ich qoldiq */}
					<div className='bg-white shadow-md rounded-lg p-4 my-4 border dark:bg-gray-800'>
						<p className='pb-2 font-bold'>
							Boshlang‘ich qoldiq{' '}
							{dateRange?.to ? format(dateRange.from, ' dd.MM.yyyy ') : ''}uchun
						</p>
						<div className='grid grid-cols-2 gap-3 text-sm '>
							<div className='bg-green-50 px-3 py-1 rounded-md border '>
								<p className='text-xs text-slate-600'>Menga Qarzdor (uzs)</p>
								<p className='font-bold text-lg text-green-700'>
									{akt.data.initial.ktSum}
								</p>
							</div>

							<div className='bg-red-50 px-3 py-1 rounded-md border'>
								<p className='text-xs text-slate-600'>Men Qarzdor (uzs)</p>
								<p className='font-bold text-lg text-red-600'>
									{akt.data.initial.dtSum}
								</p>
							</div>

							<div className='bg-green-50 px-3 py-1 rounded-md border'>
								<p className='text-xs text-slate-600'>Menga Qarzdor ($)</p>
								<p className='font-bold text-lg text-green-700'>
									{akt.data.initial.ktVal}
								</p>
							</div>

							<div className='bg-red-50 px-3 py-1 rounded-md border'>
								<p className='text-xs text-slate-600'>Men Qarzdor ($)</p>
								<p className='font-bold text-lg text-red-600'>
									{akt.data.initial.dtVal}
								</p>
							</div>
						</div>
					</div>

					{/* List kartalar */}
					<div className='flex flex-col gap-4 '>
						{akt.data.list.map((item, idx) => (
							<div
								key={idx}
								className='bg-white rounded shadow p-3 text-sm dark:bg-gray-800'
							>
								<div className='font-semibold mb-1 h-10 max-h-10'>
									{item.document}
								</div>
								<div className='text-xs text-slate-500 mb-2 dark:text-slate-200'>
									{item.date.slice(0, 10)}
								</div>
								{item.comment && (
									<div className='mb-2 text-slate-600'>{item.comment}</div>
								)}
								<div className='grid grid-cols-2 gap-2'>
									<div className='bg-green-50 px-3 py-1 rounded-md border text-xs text-slate-600'>
										Menga qarzdor (uzs) :
										<b className='block font-bold text-lg text-green-700'>
											{item.ktSum}
										</b>
									</div>
									<div className='bg-red-50 px-3 py-1 rounded-md border text-xs text-slate-600'>
										Men qarzdor (uzs) :{' '}
										<b className='block font-bold text-lg text-red-700'>
											{item.dtSum}
										</b>
									</div>
									<div className='bg-green-50 px-3 py-1 rounded-md border text-xs text-slate-600'>
										Menga qarzdor ($) :
										<b className='block font-bold text-lg text-green-700'>
											{item.ktVal}
										</b>
									</div>
									<div className='bg-red-50 px-3 py-1 rounded-md border text-xs text-slate-600 '>
										Men qarzdor ($) :{' '}
										<b className='block font-bold text-lg text-red-700'>
											{item.dtVal}
										</b>
									</div>
									<div>
										Oxirgi balans (uzs) :{' '}
										<b className='block'>{item.lastSum}</b>
									</div>
									<div>
										Oxirgi balans ($) : <b className='block'>{item.lastVal}</b>
									</div>
								</div>
							</div>
						))}
					</div>
					{/* Oxirgi qoldiq */}
					<div className='bg-white shadow-md rounded-lg p-4 my-4 border dark:bg-gray-800'>
						<p className='pb-2 font-bold'>
							Oxirgi qoldiq
							{dateRange?.to ? format(dateRange.to, ' dd.MM.yyyy ') : ''}
							sana uchun
						</p>
						<div className='grid grid-cols-2 gap-3 text-sm'>
							<div className='bg-green-50 px-3 py-1 rounded-md border'>
								<p className='text-xs text-slate-600'>Menga Qarzdor (uzs)</p>
								<p className='font-bold text-lg text-green-700'>
									{akt.data.last.ktSum}
								</p>
							</div>

							<div className='bg-red-50 px-3 py-1 rounded-md border'>
								<p className='text-xs text-slate-600'>Men Qarzdor (uzs)</p>
								<p className='font-bold text-lg text-red-600'>
									{akt.data.last.dtSum}
								</p>
							</div>

							<div className='bg-green-50 px-3 py-1 rounded-md border'>
								<p className='text-xs text-slate-600'>Menga Qarzdor ($)</p>
								<p className='font-bold text-lg text-green-700'>
									{akt.data.last.ktVal}
								</p>
							</div>

							<div className='bg-red-50 px-3 py-1 rounded-md border'>
								<p className='text-xs text-slate-600'>Men Qarzdor ($)</p>
								<p className='font-bold text-lg text-red-600'>
									{akt.data.last.dtVal}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default Report

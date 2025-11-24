import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { useState } from 'react'
import RegisterBanner from '../components/RegisterBanner'
import useAktSverka from '../hooks/useAktSverka'
import useBalance from '../hooks/useBalance'
import getDocConfig from '../hooks/useDocConfig' // ✅ renamed import

const Report = () => {
	// const tgUser = { id: 1284897972 }
	const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user

	const { balance, loading, error } = useBalance(tgUser?.id)
	const [dateRange, setDateRange] = useState({ from: null, to: null })
	const [showAkt, setShowAkt] = useState(false)

	const {
		akt,
		loading: aktLoading,
		error: aktError,
	} = useAktSverka(
		tgUser?.id,
		showAkt && dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
		showAkt && dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null
	)

	if (loading)
		return (
			<div className='w-full fixed top-0 left-0 pt-16'>
				<RegisterBanner
					registered={false}
					loading={loading}
					pageText={`Hisob-kitob va aktivlaringizni ko‘rish uchun`}
				/>
			</div>
		)
	if (error)
		return (
			<div className='w-full fixed top-0 left-0 pt-16'>
				<RegisterBanner
					registered={false}
					pageText='Buyurtmalarni ko‘rish uchun qayta urinib ko‘ring.'
				/>
			</div>
		)

	return (
		<div className='px-2 xl:px-10 py-24'>
			<h1 className='font-bold text-4xl'>Hisobot</h1>

			{/* Balans */}
			<div className='text-slate-500 my-3'>
				{balance.split('\n').map((line, idx) => (
					<p key={idx}>{line}</p>
				))}
			</div>

			{/* Sana tanlash */}
			<div className='mb-3 flex gap-3'>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant='outline'
							className='w-full justify-start text-left font-normal dark:bg-gray-800 dark:border-white'
						>
							{dateRange.from
								? format(dateRange.from, 'dd.MM.yyyy')
								: 'Boshlanish sanasi'}
						</Button>
					</PopoverTrigger>
					<PopoverContent className='w-auto p-0' align='start'>
						<Calendar
							mode='single'
							selected={dateRange.from}
							onSelect={date => setDateRange(prev => ({ ...prev, from: date }))}
						/>
					</PopoverContent>
				</Popover>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant='outline'
							className='w-full justify-start text-left font-normal dark:bg-gray-800 dark:border-white'
						>
							{dateRange.to
								? format(dateRange.to, 'dd.MM.yyyy')
								: 'Tugash sanasi'}
						</Button>
					</PopoverTrigger>
					<PopoverContent className='w-auto p-0' align='start'>
						<Calendar
							mode='single'
							selected={dateRange.to}
							onSelect={date => setDateRange(prev => ({ ...prev, to: date }))}
						/>
					</PopoverContent>
				</Popover>
			</div>

			{/* Button */}
			<Button
				className='my-1 w-full h-11 max-h-11 bg-[rgb(141,119,229)] text-white'
				disabled={!dateRange.from || !dateRange.to}
				onClick={() => setShowAkt(true)}
			>
				Hisobotni ko‘rish
			</Button>

			{/* Asosiy kontent */}
			{showAkt && akt?.data && (
				<div className='bg-slate-100 p-3 rounded-lg mt-2 mb-10 dark:bg-transparent'>
					<h2 className='font-semibold text-lg mb-3'>To‘lovlar va qarzlar</h2>

					{/* 🔹 Boshlang‘ich qoldiq */}
					<div className='bg-white shadow-md rounded-lg p-4 my-4 border dark:bg-gray-800'>
						<p className='pb-2 font-bold'>
							Boshlang‘ich qoldiq{' '}
							{dateRange?.to ? format(dateRange.from, ' dd.MM.yyyy ') : ''}{' '}
							uchun
						</p>
						<div className='grid grid-cols-2 gap-3 text-sm'>
							{['ktSum', 'dtSum', 'ktVal', 'dtVal'].map((key, i) => (
								<div
									key={key}
									className={`px-3 py-1 rounded-md border ${
										i % 2 === 0
											? 'bg-green-50 text-green-700'
											: 'bg-red-50 text-red-700'
									}`}
								>
									<p className='text-xs text-slate-600'>
										{i % 2 === 0 ? 'Menga qarzdor' : 'Men qarzdor'}{' '}
										{i < 2 ? '(uzs)' : '($)'}
									</p>
									<b className='block font-bold text-lg'>
										{akt.data.initial[key]}
									</b>
								</div>
							))}
						</div>
					</div>

					{/* 🔸 Har bir hujjat */}
					<div className='flex flex-col gap-4'>
						{[...akt.data.list]
							.sort((a, b) => new Date(a.date) - new Date(b.date))
							.map((item, idx) => {
								const { hiddenFields, bgColor } = getDocConfig(item.document)

								return (
									<div
										key={idx}
										className={`rounded shadow p-3 text-sm border ${bgColor}`}
									>
										<div className='font-semibold mb-1'>{item.document}</div>

										{item.comment && (
											<div className='mb-2 text-slate-600'>{item.comment}</div>
										)}

										<div className='grid grid-cols-2 gap-2'>
											{/* 🔹 Hidden field logic */}
											{!hiddenFields.includes('ktSum') && (
												<div className='bg-green-50 px-3 py-1 rounded-md border text-xs text-slate-600'>
													{item.textSum ? item.textSum : 'Menga qarzdor (uzs)'}{' '}
													:
													<b className='block font-bold text-lg text-green-700'>
														{item.ktSum}
													</b>
												</div>
											)}

											{!hiddenFields.includes('dtSum') && (
												<div className='bg-red-50 px-3 py-1 rounded-md border text-xs text-slate-600'>
													{item.textSum ? item.textSum : 'Men qarzdor (uzs)'} :
													<b className='block font-bold text-lg text-red-700'>
														{item.dtSum}
													</b>
												</div>
											)}

											{!hiddenFields.includes('ktVal') && (
												<div className='bg-green-50 px-3 py-1 rounded-md border text-xs text-slate-600'>
													{item.textVal ? item.textVal : 'Menga qarzdor ($)'} :
													<b className='block font-bold text-lg text-green-700'>
														{item.ktVal}
													</b>
												</div>
											)}

											{!hiddenFields.includes('dtVal') && (
												<div className='bg-red-50 px-3 py-1 rounded-md border text-xs text-slate-600'>
													{item.textVal ? item.textVal : 'Men qarzdor ($)'} :
													<b className='block font-bold text-lg text-red-700'>
														{item.dtVal}
													</b>
												</div>
											)}

											{/* 🔹 Always show final balances */}
											<div>
												Oxirgi balans (uzs):{' '}
												<b className='block'>{item.lastSum}</b>
											</div>
											<div>
												Oxirgi balans ($):{' '}
												<b className='block'>{item.lastVal}</b>
											</div>
										</div>
									</div>
								)
							})}
					</div>

					{/* 🔹 Oxirgi qoldiq */}
					<div className='bg-white shadow-md rounded-lg p-4 my-4 border dark:bg-gray-800'>
						<p className='pb-2 font-bold'>
							Oxirgi qoldiq{' '}
							{dateRange?.to ? format(dateRange.to, ' dd.MM.yyyy ') : ''} sana
							uchun
						</p>
						<div className='grid grid-cols-2 gap-3 text-sm'>
							{['ktSum', 'dtSum', 'ktVal', 'dtVal'].map((key, i) => (
								<div
									key={key}
									className={`px-3 py-1 rounded-md border ${
										i % 2 === 0
											? 'bg-green-50 text-green-700'
											: 'bg-red-50 text-red-700'
									}`}
								>
									<p className='text-xs text-slate-600'>
										{i % 2 === 0 ? 'Menga qarzdor' : 'Men qarzdor'}{' '}
										{i < 2 ? '(uzs)' : '($)'}
									</p>
									<b className='block font-bold text-lg'>
										{akt.data.last[key]}
									</b>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{console.log(akt?.data)}
		</div>
	)
}

export default Report

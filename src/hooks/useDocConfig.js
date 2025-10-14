// 🔹 Har bir hujjat turi uchun yashirinadigan maydonlar va ranglar
const CONFIG = [
	{
		key: 'Ulgurji',
		hide: [], // faqat chiqimni yashirish
		color: 'bg-white dark:bg-gray-800 dark:text-white ',
	},
	{
		key: 'Kassaga',
		hide: ['dtVal', 'dtSum'], // dollar operatsiyalarni yashirish
		color: 'bg-white dark:bg-gray-800 dark:text-white ',
	},
	{
		key: 'Kassadan',
		hide: ['ktSum', 'ktVal'], // chiqimni yashirish
		color: 'bg-white dark:bg-gray-800 dark:text-white ',
	},
	{
		key: 'Mijozdan',
		hide: ['dtVal' , 'dtSum'], // mijozdan kirim bo'lgani uchun
		color: 'bg-white dark:bg-gray-800 dark:text-white ',
	},
	{
		key: 'Tovarlar',
		hide: ['dtSum', 'dtVal'], // chiqim va dollarni yashirish
		color: 'bg-white dark:bg-gray-800 dark:text-white ',
	},
	{
		key: 'Nasiya',
		hide: [], // hammasi ko‘rinsin
		color: 'bg-white dark:bg-gray-800 dark:text-white ',
	},
	{
		key: 'To‘lov',
		hide: ['ktSum', 'ktVal'],
		color: 'bg-white dark:bg-gray-800 dark:text-white ',
	},
	{
		key: 'Qaytarish',
		hide: ['dtSum'],
		color: 'bg-white dark:bg-gray-800 dark:text-white ',
	},
]

// 🔸 Pure function — hook emas
export default function getDocConfig(documentName) {
	if (!documentName)
		return {
			hiddenFields: [],
			bgColor: 'bg-white dark:bg-gray-800 dark:text-white border-gray-200',
		}

	const found = CONFIG.find(cfg => documentName.includes(cfg.key))

	return {
		hiddenFields: found?.hide || [],
		bgColor: found?.color || 'bg-white dark:bg-gray-800 dark:text-white border-gray-200',
	}
}

import { useEffect, useState } from 'react'

function useOrderList(userId, page, pageSize) {
	const [orders, setOrders] = useState([])
	const [meta, setMeta] = useState({
		currentPage: 1,
		lastPage: 1,
		total: 0,
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
	const username = 'Direktor'
	const password = '1122'

	useEffect(() => {
		if (!userId) return

		const controller = new AbortController()
		const { signal } = controller

		async function fetchOrders() {
			try {
				setLoading(true)
				setError(null)

				const authHeader = 'Basic ' + btoa(`${username}:${password}`)

				const res = await fetch(
					`${API_BASE_URL}/order?page=${page}&pageSize=${pageSize}&userId=${userId}`,
					{
						method: 'GET',
						signal,
						headers: {
							Authorization: authHeader,
						},
					}
				)

				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`)
				}

				const json = await res.json()

				setOrders(json.data || [])

				// Laravel-like pagination structure with fallbacks
				if (json.meta) {
					const currentPageFromApi = json.meta.current_page ?? page ?? 1
					const totalFromApi =
						json.meta.total ?? (Array.isArray(json.data) ? json.data.length : 0)
					const lastPageFromApi = json.meta.last_page
					const computedLastPage = Math.max(
						1,
						Math.ceil((Number(totalFromApi) || 0) / (Number(pageSize) || 1))
					)
					setMeta({
						currentPage: Number(currentPageFromApi) || 1,
						lastPage: Number(lastPageFromApi) || computedLastPage,
						total: Number(totalFromApi) || 0,
					})
				} else {
					const totalLocal = Array.isArray(json.data) ? json.data.length : 0
					const computedLastPage = Math.max(
						1,
						Math.ceil((Number(totalLocal) || 0) / (Number(pageSize) || 1))
					)
					setMeta({
						currentPage: Number(page) || 1,
						lastPage: computedLastPage,
						total: Number(totalLocal) || 0,
					})
				}
			} catch (err) {
				if (err.name !== 'AbortError') {
					setError(err.message || 'Xatolik yuz berdi')
				}
			} finally {
				setLoading(false)
			}
		}

		fetchOrders()

		// cleanup old request
		return () => controller.abort()
	}, [userId, page, pageSize, API_BASE_URL])

	return { orders, meta, loading, error }
}

export default useOrderList

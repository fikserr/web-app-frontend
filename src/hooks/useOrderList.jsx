import { useEffect, useState } from 'react'
import api from '../lib/api'
import { getContractorId } from '../lib/auth'

const normalizeOrderPayload = payload => {
	const root = payload?.data ?? payload
	const list =
		(Array.isArray(root?.content) && root.content) ||
		(Array.isArray(root?.items) && root.items) ||
		(Array.isArray(root?.orders) && root.orders) ||
		(Array.isArray(root?.documents) && root.documents) ||
		(Array.isArray(root?.results) && root.results) ||
		(Array.isArray(root) && root) ||
		[]

	const metaSource = payload?.meta ?? root?.meta ?? payload?.pagination ?? root?.pagination ?? {}
	const total =
		Number(metaSource.total ?? root?.total ?? list.length ?? 0) || 0
	const currentPage =
		Number(metaSource.currentPage ?? metaSource.current_page ?? payload?.page ?? root?.page ?? 1) || 1
	const pageSizeFromMeta = Number(metaSource.pageSize ?? metaSource.per_page ?? 1) || 1
	const lastPage =
		Number(metaSource.lastPage ?? metaSource.last_page ?? Math.max(1, Math.ceil(total / pageSizeFromMeta))) || 1

	return {
		orders: list,
		meta: {
			currentPage,
			lastPage,
			total,
		},
	}
}

function useOrderList(userId, page, pageSize) {
	const [orders, setOrders] = useState([])
	const [meta, setMeta] = useState({
		currentPage: 1,
		lastPage: 1,
		total: 0,
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [registered, setRegistered] = useState(false)

	useEffect(() => {
		if (!userId) {
			setOrders([])
			setMeta({ currentPage: 1, lastPage: 1, total: 0 })
			setLoading(false)
			setError(null)
			return
		}

		const controller = new AbortController()
		const { signal } = controller

		async function fetchOrders() {
			try {
				setLoading(true)
				setError(null)

				// full query shape confirmed against the Postman collection's "Orders Copy > list"
				// request — filtered by customerIds (the contractor/customer tied to this
				// account's JWT) so the list only returns this contractor's own orders
				const contractorId = getContractorId()
				const query = {
					page,
					pageSize,
					userId,
					sortBy: 'date',
					sortOrder: 'desc',
					ids: '',
					statusIds: '',
					startDate: '',
					endDate: '',
					customerIds: contractorId || '',
					staffIds: '',
				}

				const res = await api.get('/documents/orders', {
					params: query,
					signal,
				})

				const { orders: normalizedOrders, meta: normalizedMeta } =
					normalizeOrderPayload(res.data)

				setOrders(normalizedOrders)
				setMeta(normalizedMeta)
				setRegistered(res.data?.registered || res.data?.data?.registered || false)
				return
			} catch (err) {
				if (err?.name !== 'AbortError') {
					setError(err?.message || 'Xatolik yuz berdi')
					setOrders([])
					setMeta({ currentPage: Number(page) || 1, lastPage: 1, total: 0 })
				}
			} finally {
				if (!controller.signal.aborted) {
					setLoading(false)
				}
			}
		}

		fetchOrders()

		return () => controller.abort()
	}, [userId, page, pageSize])

	return { orders, meta, loading, error, registered }
}

export default useOrderList

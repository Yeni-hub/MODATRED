import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(url, options)
      setData(res.data)
      return res.data
    } catch (err) {
      setError(err.response?.data?.error || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (options.lazy) return
    execute()
  }, [execute])

  return { data, loading, error, refetch: execute }
}

export function useMutation(method = 'post') {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (url, data) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api[method](url, data)
      return res.data
    } catch (err) {
      const msg = err.response?.data?.error || 'Error en la operación'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading, error }
}

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useTradesStore = defineStore('trades', () => {
  const trades = ref({})
  const allTrades = ref([])
  const loading = ref(false)
  const error = ref(null)

  const hasTrades = computed(() => Object.keys(trades.value).length > 0)

  const fetchTrades = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/trades')
      trades.value = response.data.trades
      allTrades.value = response.data.allTrades
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.error || '获取交易数据失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const addTrade = async (tradeData) => {
    try {
      const response = await api.post('/trades', tradeData)
      await fetchTrades() // Refresh trades after adding
      return { success: true, trade: response.data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || '添加交易失败' 
      }
    }
  }

  const simulateTrade = async (code, currentPrice, addShares, fee = 8.00) => {
    try {
      const response = await api.post(`/trades/simulate/${code}`, {
        currentPrice,
        addShares,
        fee
      })
      return { success: true, data: response.data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || '模拟计算失败' 
      }
    }
  }

  const getStockTrades = async (code) => {
    try {
      const response = await api.get(`/trades/${code}`)
      return { success: true, data: response.data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || '获取股票交易数据失败' 
      }
    }
  }

  return {
    trades,
    allTrades,
    loading,
    error,
    hasTrades,
    fetchTrades,
    addTrade,
    simulateTrade,
    getStockTrades
  }
})
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">我的持仓</h1>
      <router-link to="/add-trade" class="btn-primary">
        添加交易
      </router-link>
    </div>

    <!-- Alpha Vantage API Key Setting -->
    <div class="card">
      <h3 class="text-lg font-medium mb-4">Alpha Vantage API 密钥</h3>
      <div class="flex gap-2">
        <input
          v-model="alphaVantageKey"
          type="password"
          placeholder="输入您的 API 密钥（可选）"
          class="form-input flex-1"
        />
        <button @click="saveApiKey" class="btn-primary">
          保存
        </button>
      </div>
      <p class="text-sm text-gray-600 mt-2">
        如果没有密钥，系统会使用模拟数据。获取免费密钥：
        <a href="https://www.alphavantage.co/support/#api-key" target="_blank" class="text-primary-600 hover:text-primary-500">
          Alpha Vantage
        </a>
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="tradesStore.loading" class="text-center py-8">
      <div class="text-gray-600">加载中...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="tradesStore.error" class="card text-center">
      <div class="text-danger">{{ tradesStore.error }}</div>
      <button @click="tradesStore.fetchTrades" class="btn-primary mt-4">
        重试
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!tradesStore.hasTrades" class="card text-center">
      <div class="text-gray-600 mb-4">还没有任何交易记录</div>
      <router-link to="/add-trade" class="btn-primary">
        添加第一笔交易
      </router-link>
    </div>

    <!-- Portfolio Overview -->
    <div v-else class="space-y-6">
      <!-- Portfolio Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <h3 class="text-sm font-medium text-gray-500">总持仓股票数</h3>
          <p class="text-2xl font-bold text-gray-900 mt-2">{{ Object.keys(tradesStore.trades).length }}</p>
        </div>
        <div class="card">
          <h3 class="text-sm font-medium text-gray-500">总投入成本</h3>
          <p class="text-2xl font-bold text-gray-900 mt-2">${{ totalInvested.toFixed(2) }}</p>
        </div>
        <div class="card">
          <h3 class="text-sm font-medium text-gray-500">当前总市值</h3>
          <p class="text-2xl font-bold mt-2" :class="totalValue >= totalInvested ? 'text-success' : 'text-danger'">
            ${{ totalValue.toFixed(2) }}
          </p>
        </div>
      </div>

      <!-- Stock Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="stock in stocksWithQuotes" 
          :key="stock.code"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          @click="$router.push(`/detail/${stock.code}`)"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ stock.code }}</h3>
              <p class="text-sm text-gray-600">{{ stock.totalShares }} 股</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-semibold">${{ stock.currentPrice?.toFixed(2) || '--' }}</p>
              <p 
                v-if="stock.quote" 
                class="text-sm"
                :class="stock.quote.change >= 0 ? 'text-success' : 'text-danger'"
              >
                {{ stock.quote.change >= 0 ? '+' : '' }}{{ stock.quote.change.toFixed(2) }}
                ({{ stock.quote.changePercent }})
              </p>
              <button
                @click.stop="confirmAndDelete(stock.code)"
                class="mt-2 text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                title="删除该股票"
              >删除</button>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">平均成本:</span>
              <span class="font-medium">${{ stock.avgCost.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">总市值:</span>
              <span class="font-medium">${{ stock.marketValue != null ? stock.marketValue.toFixed(2) : '--' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">盈亏:</span>
              <span 
                class="font-medium"
                :class="(stock.totalProfitLoss ?? 0) >= 0 ? 'text-success' : 'text-danger'"
              >
                {{ (stock.totalProfitLoss ?? 0) >= 0 ? '+' : '' }}{{ stock.profitLossPercent != null ? stock.profitLossPercent.toFixed(2) : '--' }}%
              </span>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-200">
            <div 
              class="text-sm font-medium"
              :class="stock.totalProfitLoss >= 0 ? 'text-success' : 'text-danger'"
            >
              总盈亏: ${{ stock.totalProfitLoss.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTradesStore } from '../stores/trades'
import { useAuthStore } from '../stores/auth'
import { getStockQuote, setApiKey, getApiKey } from '../utils/stockApi'

const tradesStore = useTradesStore()
const authStore = useAuthStore()

const alphaVantageKey = ref('')
const stockQuotes = ref({})

const confirmAndDelete = async (code) => {
  if (!code) return
  if (!window.confirm(`确定删除 ${code} 的所有交易记录吗？该操作不可恢复。`)) return
  const result = await tradesStore.deleteStock(code)
  if (!result.success) {
    alert(result.error || '删除失败')
  }
}

// Initialize API key from localStorage
onMounted(() => {
  alphaVantageKey.value = getApiKey() || ''
  if (authStore.isAuthenticated) {
    tradesStore.fetchTrades()
  }
})

const saveApiKey = () => {
  setApiKey(alphaVantageKey.value)
  fetchAllQuotes()
}

const fetchAllQuotes = async () => {
  if (!tradesStore.hasTrades) return
  
  for (const code of Object.keys(tradesStore.trades)) {
    try {
      const quote = await getStockQuote(code)
      if (quote.success) {
        stockQuotes.value[code] = quote
      }
    } catch (error) {
      console.error(`Failed to fetch quote for ${code}:`, error)
    }
  }
}

const stocksWithQuotes = computed(() => {
  return Object.entries(tradesStore.trades).map(([code, stock]) => {
    const quote = stockQuotes.value[code]
    const currentPrice = (quote && !quote.mock && typeof quote.price === 'number') ? quote.price : null
    const totalCost = stock.totalCost
    const marketValue = currentPrice != null ? currentPrice * stock.totalShares : null
    const totalProfitLoss = currentPrice != null ? (marketValue - totalCost) : null
    const profitLossPercent = (currentPrice != null && totalCost > 0) ? (totalProfitLoss / totalCost) * 100 : null

    return {
      ...stock,
      code,
      currentPrice,
      marketValue,
      totalProfitLoss,
      profitLossPercent,
      quote
    }
  })
})

const totalInvested = computed(() => {
  return Object.values(tradesStore.trades).reduce((sum, stock) => sum + stock.totalCost, 0)
})

const totalValue = computed(() => {
  return stocksWithQuotes.value.reduce((sum, stock) => sum + (stock.marketValue != null ? stock.marketValue : 0), 0)
})

// Fetch quotes when trades are loaded
watch(() => tradesStore.hasTrades, (hasTrades) => {
  if (hasTrades) {
    fetchAllQuotes()
  }
})

// Refresh quotes every 30 seconds
let quoteInterval
onMounted(() => {
  quoteInterval = setInterval(fetchAllQuotes, 30000)
})

// Cleanup interval
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (quoteInterval) {
    clearInterval(quoteInterval)
  }
})
</script>
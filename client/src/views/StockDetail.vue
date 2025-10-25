<template>
  <div v-if="stockData" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ stockData.code }}</h1>
        <p class="text-gray-600 mt-1">共 {{ stockData.totalShares }} 股 • 平均成本 ${{ stockData.avgCost.toFixed(2) }}</p>
      </div>
      <div class="text-right">
        <p class="text-2xl font-bold">${{ currentPrice.toFixed(2) }}</p>
        <p 
          v-if="quote" 
          class="text-sm"
          :class="quote.change >= 0 ? 'text-success' : 'text-danger'"
        >
          {{ quote.change >= 0 ? '+' : '' }}{{ quote.change.toFixed(2) }}
          ({{ quote.changePercent }})
        </p>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500">总投入</h3>
        <p class="text-xl font-bold text-gray-900 mt-2">${{ stockData.totalCost.toFixed(2) }}</p>
      </div>
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500">当前市值</h3>
        <p class="text-xl font-bold mt-2" :class="marketValue >= stockData.totalCost ? 'text-success' : 'text-danger'">
          ${{ marketValue.toFixed(2) }}
        </p>
      </div>
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500">总盈亏</h3>
        <p 
          class="text-xl font-bold mt-2"
          :class="totalProfitLoss >= 0 ? 'text-success' : 'text-danger'"
        >
          {{ totalProfitLoss >= 0 ? '+' : '' }}{{ totalProfitLossPercent.toFixed(2) }}%
        </p>
      </div>
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500">盈亏金额</h3>
        <p 
          class="text-xl font-bold mt-2"
          :class="totalProfitLoss >= 0 ? 'text-success' : 'text-danger'"
        >
          {{ totalProfitLoss >= 0 ? '+' : '' }}$ {{ totalProfitLoss.toFixed(2) }}
        </p>
      </div>
    </div>

    <!-- Simulation Tool -->
    <div class="card">
      <h3 class="text-lg font-medium mb-4">加仓模拟器</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">当前股价</label>
          <input
            v-model.number="simulation.currentPrice"
            type="number"
            step="0.01"
            class="form-input"
            placeholder="0.00"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">加仓股数</label>
          <input
            v-model.number="simulation.addShares"
            type="number"
            class="form-input"
            placeholder="0"
            min="1"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">手续费</label>
          <input
            v-model.number="simulation.fee"
            type="number"
            step="0.01"
            class="form-input"
            placeholder="8.00"
          />
        </div>
      </div>
      
      <button 
        @click="runSimulation"
        :disabled="!simulation.currentPrice || !simulation.addShares"
        class="btn-primary"
      >
        计算新成本
      </button>

      <!-- Simulation Results -->
      <div v-if="simulationResult" class="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 class="font-medium mb-3">模拟结果</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>当前持仓:</span>
              <span>{{ simulationResult.currentShares }} 股</span>
            </div>
            <div class="flex justify-between">
              <span>当前平均成本:</span>
              <span>${{ simulationResult.currentAvgCost.toFixed(2) }}</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>新持仓:</span>
              <span>{{ simulationResult.newShares }} 股</span>
            </div>
            <div class="flex justify-between">
              <span>新平均成本:</span>
              <span class="font-medium">${{ simulationResult.newAvgCost.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>成本变化:</span>
              <span 
                :class="simulationResult.costChange >= 0 ? 'text-danger' : 'text-success'"
              >
                {{ simulationResult.costChange >= 0 ? '+' : '' }}{{ simulationResult.costChange.toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trade History -->
    <div class="card">
      <h3 class="text-lg font-medium mb-4">交易记录</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                价格
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                股数
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                手续费
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                总成本
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="trade in stockData.trades" :key="trade.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(trade.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ trade.price }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ trade.shares }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ trade.fee }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${{ ((trade.price * trade.shares) + parseFloat(trade.fee)).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Cost Chart -->
    <div class="card">
      <h3 class="text-lg font-medium mb-4">成本变化趋势</h3>
      <div class="h-64">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
  
  <div v-else class="text-center py-8">
    <div class="text-gray-600">加载中...</div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTradesStore } from '../stores/trades'
import { getStockQuote } from '../utils/stockApi'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const route = useRoute()
const tradesStore = useTradesStore()

const stockData = ref(null)
const quote = ref(null)
const chart = ref(null)
const chartCanvas = ref(null)

const simulation = reactive({
  currentPrice: '',
  addShares: '',
  fee: 8.00
})

const simulationResult = ref(null)

const currentPrice = computed(() => quote.value?.price || 0)

const marketValue = computed(() => {
  if (!stockData.value) return 0
  return currentPrice.value * stockData.value.totalShares
})

const totalProfitLoss = computed(() => {
  if (!stockData.value) return 0
  return marketValue.value - stockData.value.totalCost
})

const totalProfitLossPercent = computed(() => {
  if (!stockData.value || stockData.value.totalCost === 0) return 0
  return (totalProfitLoss.value / stockData.value.totalCost) * 100
})

const loadStockData = async () => {
  const code = route.params.code
  const result = await tradesStore.getStockTrades(code)
  if (result.success) {
    stockData.value = result.data
  }
}

const fetchQuote = async () => {
  if (!stockData.value) return
  
  try {
    const quoteResult = await getStockQuote(stockData.value.code)
    if (quoteResult.success) {
      quote.value = quoteResult
    }
  } catch (error) {
    console.error('Failed to fetch quote:', error)
  }
}

const runSimulation = async () => {
  if (!simulation.currentPrice || !simulation.addShares) return
  
  try {
    const result = await tradesStore.simulateTrade(
      stockData.value.code,
      simulation.currentPrice,
      simulation.addShares,
      simulation.fee
    )
    
    if (result.success) {
      simulationResult.value = result.data
    }
  } catch (error) {
    console.error('Simulation failed:', error)
  }
}

const createChart = () => {
  if (!stockData.value || !chartCanvas.value) return
  
  const ctx = chartCanvas.value.getContext('2d')
  
  if (chart.value) {
    chart.value.destroy()
  }
  
  const labels = stockData.value.trades.map(trade => trade.date)
  const costs = []
  let cumulativeShares = 0
  let cumulativeCost = 0
  
  stockData.value.trades.forEach(trade => {
    cumulativeShares += trade.shares
    cumulativeCost += (trade.price * trade.shares) + parseFloat(trade.fee)
    costs.push(cumulativeCost / cumulativeShares)
  })
  
  chart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '平均成本',
        data: costs,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return '$' + value.toFixed(2)
            }
          }
        }
      }
    }
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  await loadStockData()
  await fetchQuote()
  
  // Refresh quote every 30 seconds
  setInterval(fetchQuote, 30000)
  
  // Create chart after data is loaded
  setTimeout(createChart, 100)
})

watch(() => route.params.code, async () => {
  await loadStockData()
  await fetchQuote()
  createChart()
})
</script>
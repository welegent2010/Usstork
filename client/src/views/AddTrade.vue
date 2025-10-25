<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">添加交易记录</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
            股票代码
          </label>
          <input
            id="code"
            v-model="form.code"
            type="text"
            required
            class="form-input"
            placeholder="例如：AAPL, TSLA, MSFT"
            @input="form.code = form.code.toUpperCase()"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="price" class="block text-sm font-medium text-gray-700 mb-2">
              买入价格 (USD)
            </label>
            <input
              id="price"
              v-model.number="form.price"
              type="number"
              step="0.01"
              required
              class="form-input"
              placeholder="0.00"
            />
          </div>

          <div>
            <label for="shares" class="block text-sm font-medium text-gray-700 mb-2">
              股数
            </label>
            <input
              id="shares"
              v-model.number="form.shares"
              type="number"
              required
              class="form-input"
              placeholder="0"
              min="1"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
              交易日期
            </label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              required
              class="form-input"
            />
          </div>

          <div>
            <label for="fee" class="block text-sm font-medium text-gray-700 mb-2">
              手续费 (USD)
            </label>
            <input
              id="fee"
              v-model.number="form.fee"
              type="number"
              step="0.01"
              class="form-input"
              placeholder="8.00"
            />
          </div>
        </div>

        <!-- Trade Summary -->
        <div v-if="form.price && form.shares" class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-gray-700 mb-2">交易摘要</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>股票总价:</span>
              <span>${{ stockTotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>手续费:</span>
              <span>${{ form.fee.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-medium border-t pt-1">
              <span>总成本:</span>
              <span>${{ totalCost.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div v-if="error" class="text-danger text-sm">
          {{ error }}
        </div>

        <div class="flex space-x-4">
          <button
            type="button"
            @click="$router.push('/')"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary flex-1"
          >
            {{ loading ? '添加中...' : '添加交易' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useTradesStore } from '../stores/trades'
import { useRouter } from 'vue-router'

const tradesStore = useTradesStore()
const router = useRouter()

const form = reactive({
  code: '',
  price: '',
  shares: '',
  date: new Date().toISOString().split('T')[0],
  fee: 8.00
})

const loading = ref(false)
const error = ref('')

const stockTotal = computed(() => {
  return (parseFloat(form.price) || 0) * (parseInt(form.shares) || 0)
})

const totalCost = computed(() => {
  return stockTotal.value + (parseFloat(form.fee) || 0)
})

const handleSubmit = async () => {
  if (!form.code || !form.price || !form.shares) {
    error.value = '请填写所有必填字段'
    return
  }

  if (parseFloat(form.price) <= 0 || parseInt(form.shares) <= 0) {
    error.value = '价格和股数必须大于0'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await tradesStore.addTrade({
      code: form.code.toUpperCase(),
      price: parseFloat(form.price),
      shares: parseInt(form.shares),
      date: form.date,
      fee: parseFloat(form.fee)
    })

    if (result.success) {
      router.push('/')
    } else {
      error.value = result.error
    }
  } catch (err) {
    error.value = '添加交易失败，请重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Set today's date as default
  form.date = new Date().toISOString().split('T')[0]
})
</script>
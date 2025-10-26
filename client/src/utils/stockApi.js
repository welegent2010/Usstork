const ALPHA_VANTAGE_API_KEY = localStorage.getItem('alphaVantageKey') || 'demo'
// Normalize user-entered symbols like "INTCUS" or "LAC US" -> "INTC" / "LAC"
export const normalizeSymbol = (symbol) => {
  if (!symbol) return ''
  let s = String(symbol).toUpperCase().trim()
  // remove spaces
  s = s.replace(/\s+/g, '')
  // remove common US suffix patterns: US, .US, -US, :US, /US
  s = s.replace(/(?:\.|-|:|\/)?US$/, '')
  return s
}

const API_BASE = 'https://www.alphavantage.co/query'

export const getStockQuote = async (symbol) => {
  try {
    const apiKey = localStorage.getItem('alphaVantageKey') || 'demo'
    const norm = normalizeSymbol(symbol)
    const response = await fetch(`${API_BASE}?function=GLOBAL_QUOTE&symbol=${norm}&apikey=${apiKey}`)
    const data = await response.json()
    
    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      return {
        success: true,
        price: parseFloat(data['Global Quote']['05. price']),
        change: parseFloat(data['Global Quote']['09. change']),
        changePercent: data['Global Quote']['10. change percent']
      }
    } else {
      // Return mock data for demo
      return {
        success: true,
        price: Math.random() * 200 + 50, // Mock price between 50-250
        change: (Math.random() - 0.5) * 10,
        changePercent: `${(Math.random() - 0.5) * 5}%`,
        mock: true
      }
    }
  } catch (error) {
    console.error('Error fetching stock quote:', error)
    // Return mock data on error
    return {
      success: true,
      price: Math.random() * 200 + 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: `${(Math.random() - 0.5) * 5}%`,
      mock: true
    }
  }
}

export const setApiKey = (apiKey) => {
  localStorage.setItem('alphaVantageKey', apiKey)
}

export const getApiKey = () => {
  return localStorage.getItem('alphaVantageKey')
}
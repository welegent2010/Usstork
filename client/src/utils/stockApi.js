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

// Fallback: search best symbol when GLOBAL_QUOTE returns empty (e.g., ticker changed like INT->WKC or LAC->LAAC)
const searchSymbol = async (keywords, apiKey) => {
  try {
    const resp = await fetch(`${API_BASE}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${apiKey}`)
    const data = await resp.json()
    const matches = data?.bestMatches || []
    if (!Array.isArray(matches) || matches.length === 0) return null
    // Prefer US listings and USD currency
    const preferred = matches.find(m => /United States/i.test(m["4. region"]) || /USD/i.test(m["8. currency"]))
    return (preferred?.["1. symbol"]) || (matches[0]?.["1. symbol"]) || null
  } catch (e) {
    console.warn('symbol search failed:', e)
    return null
  }
}

export const getStockQuote = async (symbol) => {
  try {
    const apiKey = localStorage.getItem('alphaVantageKey') || 'demo'
    const norm = normalizeSymbol(symbol)

    // The demo key only supports IBM; for others, return mock immediately
    if (apiKey === 'demo' && norm !== 'IBM') {
      return {
        success: true,
        price: Math.random() * 200 + 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: `${(Math.random() - 0.5) * 5}%`,
        mock: true,
        reason: 'demo_key'
      }
    }

    const response = await fetch(`${API_BASE}?function=GLOBAL_QUOTE&symbol=${norm}&apikey=${apiKey}`)
    const data = await response.json()

    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      return {
        success: true,
        price: parseFloat(data['Global Quote']['05. price']),
        change: parseFloat(data['Global Quote']['09. change']),
        changePercent: data['Global Quote']['10. change percent']
      }
    }

    // If no price, try to resolve with SYMBOL_SEARCH (ticker changed or not supported)
    const resolved = await searchSymbol(norm, apiKey)
    if (resolved && resolved !== norm) {
      const resp2 = await fetch(`${API_BASE}?function=GLOBAL_QUOTE&symbol=${resolved}&apikey=${apiKey}`)
      const data2 = await resp2.json()
      if (data2['Global Quote'] && data2['Global Quote']['05. price']) {
        return {
          success: true,
          price: parseFloat(data2['Global Quote']['05. price']),
          change: parseFloat(data2['Global Quote']['09. change']),
          changePercent: data2['Global Quote']['10. change percent'],
          resolvedSymbol: resolved
        }
      }
    }

    const reason = data?.Note ? 'rate_limit' : 'no_price'
    // Return mock data if still no price
    return {
      success: true,
      price: Math.random() * 200 + 50, // Mock price between 50-250
      change: (Math.random() - 0.5) * 10,
      changePercent: `${(Math.random() - 0.5) * 5}%`,
      mock: true,
      reason
    }
  } catch (error) {
    console.error('Error fetching stock quote:', error)
    // Return mock data on error
    return {
      success: true,
      price: Math.random() * 200 + 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: `${(Math.random() - 0.5) * 5}%`,
      mock: true,
      reason: 'fetch_error'
    }
  }
}

export const setApiKey = (apiKey) => {
  localStorage.setItem('alphaVantageKey', apiKey)
}

export const getApiKey = () => {
  return localStorage.getItem('alphaVantageKey')
}
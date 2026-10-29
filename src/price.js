const { price: priceConfig } = require('./config')

const sats = (btc) => `${Number(btc) * 100000000} sats`

const jsonGet = async (url, headers) => {
    const response = await fetch(url, { headers })
    const body = await response.json()
    if (!response.ok) {
        const message = body.status && body.status.error_message
            ? body.status.error_message
            : body.error || `HTTP ${response.status}`
        throw new Error(message)
    }
    return body
}

const fromCoinMarketCap = async (apiKey) => {
    if (!apiKey) {
        throw new Error('Set coinmarketcap in keys.js')
    }
    const body = await jsonGet(
        'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=DIVI&convert=USD,BTC',
        { 'X-CMC_PRO_API_KEY': apiKey }
    )
    const coin = body.data && body.data.DIVI && body.data.DIVI[0]
    const quote = coin && coin.quote
    if (!quote || !quote.USD || !quote.BTC) {
        throw new Error('CoinMarketCap did not return USD and BTC quotes for DIVI')
    }
    return {
        usd: quote.USD.price,
        btc: sats(quote.BTC.price),
        source: 'coinmarketcap'
    }
}

const fromCoinGecko = async (apiKey) => {
    const headers = {}
    if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey
    }
    const body = await jsonGet(
        'https://api.coingecko.com/api/v3/simple/price?ids=divi&vs_currencies=usd,btc',
        headers
    )
    const coin = body.divi
    if (!coin || coin.usd === undefined || coin.btc === undefined) {
        throw new Error('CoinGecko did not return USD and BTC prices for DIVI')
    }
    return {
        usd: coin.usd,
        btc: sats(coin.btc),
        source: 'coingecko'
    }
}

const requestedSource = (req) => {
    const fromQuery = req.query && (req.query.source || req.query.provider)
    return String(fromQuery || priceConfig.source || '').toLowerCase()
}

const getDiviPrice = async (req) => {
    const source = requestedSource(req)
    if (source === 'coinmarketcap' || source === 'cmc') {
        return fromCoinMarketCap(priceConfig.coinmarketcap)
    }
    if (source === 'coingecko' || source === 'cg') {
        return fromCoinGecko(priceConfig.coingecko)
    }
    if (priceConfig.coinmarketcap) {
        return fromCoinMarketCap(priceConfig.coinmarketcap)
    }
    if (priceConfig.coingecko) {
        return fromCoinGecko(priceConfig.coingecko)
    }
    throw new Error('Set coinmarketcap or coingecko in keys.js (see keys.example.js)')
}

module.exports = {
    getDiviPrice
}

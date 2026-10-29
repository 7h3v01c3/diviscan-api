const { parseBoolFlag } = require('./flags')

let keys
try {
    keys = require('../keys')
} catch (err) {
    keys = {
        user: process.env.RPC_USER || 'user',
        pass: process.env.RPC_PASS || 'pass'
    }
}

const coinmarketcap = keys.coinmarketcap || process.env.COINMARKETCAP_API_KEY || ''
const coingecko = keys.coingecko || process.env.COINGECKO_API_KEY || ''
const explicitEnable = keys.enablePrice ?? process.env.ENABLE_PRICE
const priceEnabled = explicitEnable === undefined || explicitEnable === ''
    ? Boolean(coinmarketcap || coingecko)
    : parseBoolFlag(explicitEnable)

module.exports = {
    config: {
        protocol: process.env.RPC_PROTOCOL || 'http',
        user: keys.user,
        pass: keys.pass,
        host: process.env.RPC_HOST || '127.0.0.1',
        port: process.env.RPC_PORT || '51473'
    },
    price: {
        enabled: priceEnabled,
        coinmarketcap,
        coingecko,
        source: keys.priceSource || process.env.PRICE_SOURCE || ''
    }
}

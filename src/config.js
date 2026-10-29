let keys
try {
    keys = require('../keys')
} catch (err) {
    keys = {
        user: process.env.RPC_USER || 'user',
        pass: process.env.RPC_PASS || 'pass'
    }
}

module.exports = {
    config: {
        protocol: process.env.RPC_PROTOCOL || 'http',
        user: keys.user,
        pass: keys.pass,
        host: process.env.RPC_HOST || '127.0.0.1',
        port: process.env.RPC_PORT || '51473'
    },
    price: {
        coinmarketcap: keys.coinmarketcap || process.env.COINMARKETCAP_API_KEY || '',
        coingecko: keys.coingecko || process.env.COINGECKO_API_KEY || '',
        source: keys.priceSource || process.env.PRICE_SOURCE || ''
    }
}

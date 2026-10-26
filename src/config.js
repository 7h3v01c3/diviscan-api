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
    }
}

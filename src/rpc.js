const http = require('http')
const https = require('https')
const config = require('./config').config

const defaultInvoke = (method, params) => new Promise((resolve, reject) => {
    const payload = JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: Math.floor(Math.random() * 100000)
    })
    const isHttp = config.protocol === 'http'
    const transport = isHttp ? http : https
    const options = {
        host: config.host,
        port: config.port,
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            Authorization: `Basic ${Buffer.from(`${config.user}:${config.pass}`).toString('base64')}`
        }
    }

    const req = transport.request(options, (res) => {
        let body = ''
        res.on('data', (chunk) => {
            body += chunk
        })
        res.on('end', () => {
            if (res.statusCode === 401) {
                reject(rpcError('Connection Rejected: 401 Unauthorized', 401))
                return
            }
            if (res.statusCode === 403) {
                reject(rpcError('Connection Rejected: 403 Forbidden', 403))
                return
            }

            let parsed
            try {
                parsed = JSON.parse(body)
            } catch (err) {
                reject(rpcError(`Error Parsing JSON: ${err.message}`))
                return
            }

            if (parsed.error) {
                const err = rpcError(parsed.error.message || 'RPC error', parsed.error.code)
                err.rpc = parsed
                reject(err)
                return
            }

            resolve(parsed)
        })
    })

    req.on('error', (err) => {
        reject(rpcError(`Request Error: ${err.message}`))
    })
    req.write(payload)
    req.end()
})

let invoke = defaultInvoke

const rpcError = (message, code) => {
    const err = new Error(message)
    if (code !== undefined) {
        err.code = code
    }
    return err
}

const call = (method, params = []) => invoke(method, params)

const setInvoker = (fn) => {
    invoke = fn
}

const resetInvoker = () => {
    invoke = defaultInvoke
}

module.exports = {
    call,
    resetInvoker,
    setInvoker
}

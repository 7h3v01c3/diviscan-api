const rpc = require('./rpc')

const invalidTx = (err) => err && err.code === -5

const sendRpc = async (res, method, params = [], { unwrap = false } = {}) => {
    try {
        const response = await rpc.call(method, params)
        res.json(unwrap ? response.result : response)
    } catch (err) {
        console.log(err)
        if (invalidTx(err)) {
            res.json({ error: 'Invalid transaction' })
            return
        }
        res.json(err.rpc && err.rpc.error ? err.rpc.error : { error: err.message })
    }
}

module.exports = {
    sendRpc
}

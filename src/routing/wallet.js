const rpc = require('../rpc')
const { positionalRpcParams } = require('../rpc-params')
const { sendRpc } = require('../send-rpc')

const numericAmount = (amount) => Number(amount)

module.exports = (app) => {
    app.get('/getaccount/:addr', async (req, res) => {
        try {
            const response = await rpc.call('getaccount', [req.params.addr])
            res.json(response)
        } catch (err) {
            res.json({ Error: 'err' })
        }
    })

    app.get('/accountaddress/:acct', (req, res) => {
        sendRpc(res, 'getaccountaddress', [req.params.acct])
    })

    app.get('/addrsbyaccount/:acct', (req, res) => {
        sendRpc(res, 'getaddressesbyaccount', [req.params.acct])
    })

    app.get('/newaddress/:accountname', (req, res) => {
        sendRpc(res, 'getnewaddress', [req.params.accountname])
    })

    app.get('/balance/:acct', (req, res) => {
        sendRpc(res, 'getbalance', [req.params.acct])
    })

    app.get('/getreceived/:addr', (req, res) => {
        sendRpc(res, 'getreceivedbyaddress', [req.params.addr])
    })

    app.get('/listreceived', (req, res) => {
        sendRpc(res, 'listreceivedbyaddress')
    })

    app.get('/addvault/:vault/:fundingTxHash', (req, res) => {
        sendRpc(res, 'addvault', [req.params.vault, req.params.fundingTxHash])
    })

    app.get('/fundvault/:vault/:amount', (req, res) => {
        sendRpc(res, 'fundvault', [req.params.vault, numericAmount(req.params.amount)])
    })

    app.get('/debitvaultbyname/:source/:destination/:amount', (req, res) => {
        const feeMode = req.query.feeMode || req.query.feemode
        sendRpc(res, 'debitvaultbyname', positionalRpcParams(
            req.params.source,
            req.params.destination,
            numericAmount(req.params.amount),
            feeMode
        ))
    })

    app.get('/reclaimvaultfunds/:destination/:amount', (req, res) => {
        const feeMode = req.query.feeMode || req.query.feemode || req.query.metadata
        const comment = req.query.comment
        const commentTo = req.query.commentTo || req.query['comment-to']
        sendRpc(res, 'reclaimvaultfunds', positionalRpcParams(
            req.params.destination,
            numericAmount(req.params.amount),
            feeMode,
            comment,
            commentTo
        ))
    })

    app.get('/removevault/:vault', (req, res) => {
        sendRpc(res, 'removevault', [req.params.vault])
    })
}

const CoinGecko = require('coingecko-api')
const _ = require('lodash')
const rpc = require('../rpc')
const { positionalRpcParams } = require('../rpc-params')
const { sendRpc } = require('../send-rpc')
const { addressIndexArgs, detailedAvailability, onlyVaultsFromRequest } = require('../flags')

const numericAmount = (amount) => Number(amount)

module.exports = (app) => {
    const CoinGeckoClient = new CoinGecko()

    app.use((req, res, next) => {
        const ip = req.headers['cf-connecting-ip']
        console.log({ time: Date.now(), ip })
        next()
    })

    app.get('/ping', (req, res) => {
        res.json('pong')
    })

    app.get('/blockcount', (req, res) => {
        sendRpc(res, 'getblockcount')
    })

    app.get('/block/:hash', (req, res) => {
        sendRpc(res, 'getblock', [req.params.hash])
    })

    app.get('/blockhash/:block', (req, res) => {
        sendRpc(res, 'getblockhash', [req.params.block])
    })

    app.get('/info', (req, res) => {
        sendRpc(res, 'getinfo')
    })

    app.get('/tx/:txid', (req, res) => {
        sendRpc(res, 'getrawtransaction', [req.params.txid, 1], { unwrap: true })
    })

    app.get('/connectioncount', (req, res) => {
        sendRpc(res, 'getconnectioncount')
    })

    app.get('/getcoinavailability/:detailed?', (req, res) => {
        const params = detailedAvailability(req) ? [true] : []
        sendRpc(res, 'getcoinavailability', params)
    })

    const addressIndexRoute = (path, method, { asObject = true, asBatch = false } = {}) => {
        app.get(`${path}/:address/:only_vaults?`, (req, res) => {
            sendRpc(
                res,
                method,
                addressIndexArgs(req.params.address, onlyVaultsFromRequest(req), { asObject }),
                { asBatch }
            )
        })
    }

    addressIndexRoute('/address-deltas', 'getaddressdeltas', { asBatch: true })
    addressIndexRoute('/getaddressbalance', 'getaddressbalance')
    addressIndexRoute('/getaddressdeltas', 'getaddressdeltas')
    addressIndexRoute('/getaddresstxids', 'getaddresstxids')
    addressIndexRoute('/getaddressutxos', 'getaddressutxos')
    addressIndexRoute('/address_utxos', 'getaddressutxos', { asObject: false })

    app.get('/address/:address', async (req, res) => {
        const reqAddress = req.params.address
        const onlyVaults = onlyVaultsFromRequest(req)
        const addressObj = {
            addresses: [reqAddress],
            start: 0,
            end: 10000000000000000000
        }
        const txidParams = onlyVaults ? [addressObj, true] : [addressObj]
        const balanceParams = addressIndexArgs(reqAddress, onlyVaults)

        try {
            const txs = await rpc.call('getaddresstxids', txidParams)
            const txidArray = txs.result || []
            const transactionInfo = []

            for (const transactionId of txidArray) {
                const raw = await rpc.call('getrawtransaction', [transactionId, 1])
                transactionInfo.push(raw)
            }

            const balance = await rpc.call('getaddressbalance', balanceParams)
            res.json({
                transaction_info: transactionInfo,
                balance_info: balance
            })
        } catch (err) {
            console.log(err)
            res.json(err.rpc && err.rpc.error ? err.rpc.error : { error: err.message })
        }
    })

    app.get('/latest-blocks', async (req, res) => {
        try {
            const best = await rpc.call('getbestblockhash')
            const blocks = []
            let hash = best.result

            for (let i = 0; i < 10 && hash; i++) {
                const info = await rpc.call('getblock', [hash])
                blocks.push(info.result)
                hash = info.result && info.result.previousblockhash
            }

            res.json(blocks)
        } catch (err) {
            console.log(err)
            res.json({ error: err.message })
        }
    })

    app.get('/blockheight/:index', async (req, res) => {
        try {
            const hash = await rpc.call('getblockhash', [req.params.index])
            const block = await rpc.call('getblock', [hash.result])
            res.json(block.result)
        } catch (err) {
            res.json({ error: err.message })
        }
    })

    app.get('/decode-raw-tx/:hex', (req, res) => {
        sendRpc(res, 'decoderawtransaction', [req.params.hex], { unwrap: true })
    })

    app.get('/account-details/:account?', async (req, res) => {
        const account = req.params.account ? req.params.account : ''
        try {
            const response = await rpc.call('listtransactions', [account, 10000000])
            const addresses = _.uniq(
                (response.result || [])
                    .map((transaction) => transaction.address)
                    .filter((address) => address !== undefined)
            )
            const balanceArray = []

            for (const uniqAddress of addresses) {
                const resp = await rpc.call('getaddressbalance', addressIndexArgs(uniqAddress, false))
                balanceArray.push({
                    address: uniqAddress,
                    balance: resp.result.balance / 100000000
                })
            }

            res.json(balanceArray)
        } catch (err) {
            console.log('account details error:', err)
            res.json({ error: err.message })
        }
    })

    app.get('/price', async (req, res) => {
        try {
            const data = await CoinGeckoClient.coins.fetch('divi')
            const usd = data.data.market_data.current_price.usd
            const btc = data.data.market_data.current_price.btc
            res.json({
                usd,
                btc: `${btc * 100000000} sats`
            })
        } catch (err) {
            console.error(err)
            res.json({ error: err.message })
        }
    })

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

    app.get('/send/:to/:amount', (req, res) => {
        sendRpc(res, 'sendtoaddress', [req.params.to, numericAmount(req.params.amount)])
    })
}

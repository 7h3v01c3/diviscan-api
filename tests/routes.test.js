const { after, before, describe, it } = require('node:test')
const assert = require('node:assert/strict')
const http = require('node:http')
const rpc = require('../src/rpc')

const jsonGet = (port, path) => new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path }, (res) => {
        let body = ''
        res.on('data', (chunk) => {
            body += chunk
        })
        res.on('end', () => {
            let parsed = body
            try {
                parsed = JSON.parse(body)
            } catch (err) {
                parsed = body
            }
            resolve({ status: res.statusCode, body: parsed })
        })
    }).on('error', reject)
})

describe('vault routes and masternode removal', () => {
    let server
    let port
    let lastCall
    let app

    before(async () => {
        rpc.setInvoker(async (method, params) => {
            lastCall = { method, params }
            if (method === 'getcoinavailability') {
                if (params[0] === true) {
                    return {
                        result: {
                            Vaulted: { AllVaults: [], NonVaults: 0.0 },
                            Stakable: { AllVaults: [], NonVaults: 0.0002 },
                            Spendable: { AllVaults: [], NonVaults: 0.0002 }
                        }
                    }
                }
                return {
                    result: {
                        Vaulted: 0.0,
                        Stakable: 0.0002,
                        Spendable: 0.0002
                    }
                }
            }
            return { result: `${method}-ok`, params }
        })
        app = require('../index')
        server = await new Promise((resolve) => {
            const listener = app.listen(0, '127.0.0.1', () => resolve(listener))
        })
        port = server.address().port
    })

    after(async () => {
        rpc.resetInvoker()
        await new Promise((resolve, reject) => {
            server.close((err) => (err ? reject(err) : resolve()))
        })
    })

    it('pings', async () => {
        const res = await jsonGet(port, '/ping')
        assert.equal(res.body, 'pong')
    })

    it('does not keep masternode or mncounts routes', async () => {
        for (const path of ['/masternodes', '/mncounts', '/masternode-rewards', '/masternode/abc']) {
            const res = await jsonGet(port, path)
            assert.equal(res.status, 404)
        }
    })

    it('calls getcoinavailability with no args for totals', async () => {
        const res = await jsonGet(port, '/getcoinavailability')
        assert.equal(lastCall.method, 'getcoinavailability')
        assert.deepEqual(lastCall.params, [])
        assert.equal(res.body.result.Vaulted, 0.0)
        assert.equal(res.body.result.Stakable, 0.0002)
        assert.equal(res.body.result.Spendable, 0.0002)
    })

    it('calls getcoinavailability true for AllVaults/NonVaults', async () => {
        const res = await jsonGet(port, '/getcoinavailability/true')
        assert.equal(lastCall.method, 'getcoinavailability')
        assert.deepEqual(lastCall.params, [true])
        assert.deepEqual(res.body.result.Vaulted, { AllVaults: [], NonVaults: 0.0 })
    })

    it('passes only_vaults through to address-index RPCs', async () => {
        await jsonGet(port, '/getaddressbalance/Dabc/true')
        assert.equal(lastCall.method, 'getaddressbalance')
        assert.deepEqual(lastCall.params, [{ addresses: ['Dabc'] }, true])

        await jsonGet(port, '/getaddressdeltas/Dabc?only_vaults=true')
        assert.equal(lastCall.method, 'getaddressdeltas')
        assert.deepEqual(lastCall.params, [{ addresses: ['Dabc'] }, true])

        await jsonGet(port, '/getaddresstxids/Dabc')
        assert.equal(lastCall.method, 'getaddresstxids')
        assert.deepEqual(lastCall.params, [{ addresses: ['Dabc'] }])

        await jsonGet(port, '/address_utxos/Dabc?only_vaults=true')
        assert.equal(lastCall.method, 'getaddressutxos')
        assert.deepEqual(lastCall.params, ['Dabc', true])
    })

    it('exposes vault wallet RPCs including reclaimvaultfunds', async () => {
        await jsonGet(port, '/addvault/Downer:Dmgr/txhash1')
        assert.deepEqual(lastCall, { method: 'addvault', params: ['Downer:Dmgr', 'txhash1'] })

        await jsonGet(port, '/fundvault/Dmgr/1.5')
        assert.deepEqual(lastCall, { method: 'fundvault', params: ['Dmgr', 1.5] })

        await jsonGet(port, '/debitvaultbyname/vaultenc/Ddest/0.1?feeMode=standard')
        assert.deepEqual(lastCall, {
            method: 'debitvaultbyname',
            params: ['vaultenc', 'Ddest', 0.1, 'standard']
        })

        await jsonGet(port, '/reclaimvaultfunds/Ddest/2?feeMode=standard&comment=note&commentTo=bob')
        assert.deepEqual(lastCall, {
            method: 'reclaimvaultfunds',
            params: ['Ddest', 2, 'standard', 'note', 'bob']
        })

        await jsonGet(port, '/removevault/Downer:Dmgr')
        assert.deepEqual(lastCall, { method: 'removevault', params: ['Downer:Dmgr'] })
    })
})

const { sendRpc } = require('../send-rpc')

module.exports = (app) => {
    app.get('/send/:to/:amount', (req, res) => {
        sendRpc(res, 'sendtoaddress', [req.params.to, Number(req.params.amount)])
    })
}

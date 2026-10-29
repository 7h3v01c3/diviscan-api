# Diviscan APIs

A RESTful API for making RPC calls to the Divi blockchain. Used for the diviscan block explorer.

# Motivation

The Divi Project ecosystem is a robust network of technologies. Interfacing directly with the blockchain can be challenging and inaccessible for even seasoned developers. Although libraries like [divid-rpc](https://github.com/Divicoin/divid-rpc) exist for interfacing with the blockchain via Javascript, there are few other programmatic ways to develop with Divi.

Other limitations, such as package dependencies may limit developers from exercising the full feature set offered by `divid-rpc`.

Furthermore, the `divid-rpc` library still requires the developer to parse the results into usable data after creating methods that function as a developer or user intends.

For this reason, this library of server-side API endpoints was created to allow any request framework to make calls to the public blockchain with ease. Results are easily consumable and provide enough data for a variety of applications to be created.

# Usage

All endpoints can be retrieved by accessing 'https://api.diviscan.io' or you can host your own using this library.

These endpoints will remain publicly accessible as long as they are not abused. If they are spammed or used for malicious purposes, custom hosting will be required for usage.

# Technologies used

* NodeJS
* ExpressJS
* NPM

# Custom hosting

1. Fork this repository and `npm install` all dependencies.

2. Download the [Divi blockchain](https://github.com/Divicoin/Divi/releases/tag/1.0.3-CLI) for your operating system or feel free to [compile from source](https://github.com/divicoin/divi)

3. You will need a full Divi node running on the server where these APIs are hosted in order for the configuration to speak to the daemon.

Example config.js:
```javascript
module.exports = {
    config: {
        protocol: 'http',
        user: keys.user,
        pass: keys.pass,
        host: '127.0.0.1',
        port: '51473'
    }
}
```
4. In the root directory create a file titled `keys.js`

Example keys.js
```javascript
module.exports = {
    user: 'RandomName',
    pass: 'SuperSecretRandomPasswordChangeOrBePwned',
    coinmarketcap: 'YourCoinMarketCapApiKey',
    coingecko: 'YourCoinGeckoApiKey',
    priceSource: 'coinmarketcap'
}
```

Copy `keys.example.js` to `keys.js` and fill in secrets. `keys.js` is gitignored. `/price` reads `coinmarketcap` and `coingecko` from that file (or `COINMARKETCAP_API_KEY` / `COINGECKO_API_KEY`). Set `priceSource` to `coinmarketcap` or `coingecko`, or pass `?source=coinmarketcap` / `?source=coingecko`. If `priceSource` is empty, CoinMarketCap is used when its key is set, otherwise CoinGecko.

5. Run `./divid -reindex -addressindex` on startup.

**NOTE:** You can also add `addressindex=1` to your `divi.conf` file to achieve the same effect. You should always `-reindex` the node on startup regardless.

6. Start the API server with `npm start`

Wallet vault RPCs (`addvault`, `fundvault`, `debitvaultbyname`, `reclaimvaultfunds`, `removevault`) and `getcoinavailability` target daemon v3.0.0.0. `getcoinavailability` works on the daemon but is omitted from daemon `help`; this API still calls it.

# Endpoints

Node specific endpoints will only return data based on the node where the API is being hosted.

**GET Requests**

| Endpoint | Params | Response | Node Specific |
| -------- | ------ | -------- | -------- |
| `/accountaddress/` | `account` | address of account | true |
| `/address/` | `address`, `only_vaults` (optional) | transaction, balance, and delta info | false |
| `/address_utxos/` | `address`, `only_vaults` (optional) | all UTXOs from an address | false |
| `/addrsbyaccount/` | `account` | all addresses of specified account | true |
| `/addvault/` | `vault` (`owner:manager`), `fundingTxHash` | add a vault to the wallet | true |
| `/balance/` | `account` | get balance of account | true |
| `/block/` | `hash` | block object | false |
| `/blockcount` | | number of blocks | false |
| `/blockhash/` | `block` | details of block | false |
| `/connectioncount` | | number of active peers | true |
| `/debitvaultbyname/` | `source`, `destination`, `amount`, `feeMode` (optional query) | withdraw from a named vault | true |
| `/decode-raw-tx/` | `hex` | decoded raw transaction details | false |
| `/fundvault/` | `vault` (`[owner:]manager`), `amount` | fund a vault | true |
| `/getaccount/` | `address` | account name | true |
| `/getaddressbalance/` | `address`, `only_vaults` (optional) | address or vault-owner balance | false |
| `/getaddressdeltas/` | `address`, `only_vaults` (optional) | address or vault-owner deltas | false |
| `/getaddresstxids/` | `address`, `only_vaults` (optional) | address or vault-owner txids | false |
| `/getaddressutxos/` | `address`, `only_vaults` (optional) | address or vault-owner UTXOs | false |
| `/getcoinavailability` | `detailed` (optional; `true` for AllVaults/NonVaults split) | `{Vaulted, Stakable, Spendable}` totals, or each split into `{AllVaults, NonVaults}` | true |
| `/getreceived/` | `address` | amount received | true |
| `/info` | | info object | false |
| `/listreceived` | | wallet tx object | true |
| `/newaddress/` | `account name` | new address | true |
| `/price` | `source` (optional: `coinmarketcap` or `coingecko`) | current price of DIVI in USD and BTC | false |
| `/reclaimvaultfunds/` | `destination`, `amount`, optional query `feeMode` or `metadata`, `comment`, `commentTo` | reclaim vault funds to a destination | true |
| `/removevault/` | `vault` (`owner:manager`) | remove a vault from the wallet | true |
| `/sendfrom/` | `from`, `to`, `amount` | transaction id | true |
| `/tx/` | `txid` | tx object | false |

Address-index routes accept `only_vaults` as a query (`?only_vaults=true`) or as a trailing path segment (`/true`). `getaddressbalance`, `getaddressdeltas`, `getaddresstxids`, and `getaddressutxos` pass that flag through to the daemon.

`/getcoinavailability` with no args returns wallet totals:

```json
{
  "Vaulted": 0.0,
  "Stakable": 0.0002,
  "Spendable": 0.0002
}
```

`/getcoinavailability/true` (or `?detailed=true`) returns each bucket as `{AllVaults, NonVaults}`.

# Use cases

If you'd like your app listed here, just reach out to info@diviproject.org with the subject line: Diviscan API Application

This API is currently being used by:

* [Divi TipBot]
* [KnowCryptoShow Bot]

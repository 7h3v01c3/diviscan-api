const truthy = new Set(['true', '1', 'yes'])

const parseBoolFlag = (value) => {
    if (value === true || value === 1) {
        return true
    }
    if (typeof value !== 'string') {
        return false
    }
    return truthy.has(value.toLowerCase())
}

const onlyVaultsFromRequest = (req) => {
    const fromQuery = req.query && (req.query.only_vaults ?? req.query.onlyVaults)
    const fromParams = req.params && req.params.only_vaults
    return parseBoolFlag(fromQuery) || parseBoolFlag(fromParams)
}

const addressIndexArgs = (address, onlyVaults, { asObject = true } = {}) => {
    const first = asObject ? { addresses: [address] } : address
    return onlyVaults ? [first, true] : [first]
}

const detailedAvailability = (req) => (
    parseBoolFlag(req.params && req.params.detailed)
    || parseBoolFlag(req.query && req.query.detailed)
)

module.exports = {
    addressIndexArgs,
    detailedAvailability,
    onlyVaultsFromRequest,
    parseBoolFlag
}

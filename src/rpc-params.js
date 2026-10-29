const omitted = (value) => value === undefined || value === null || value === ''

const positionalRpcParams = (...values) => {
    let end = values.length
    while (end > 0 && omitted(values[end - 1])) {
        end -= 1
    }
    return values.slice(0, end).map((value) => (omitted(value) ? '' : value))
}

module.exports = {
    positionalRpcParams
}

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
    addressIndexArgs,
    detailedAvailability,
    onlyVaultsFromRequest,
    parseBoolFlag
} = require('../src/flags')

describe('parseBoolFlag', () => {
    it('accepts true, 1, and common strings', () => {
        assert.equal(parseBoolFlag(true), true)
        assert.equal(parseBoolFlag(1), true)
        assert.equal(parseBoolFlag('true'), true)
        assert.equal(parseBoolFlag('TRUE'), true)
        assert.equal(parseBoolFlag('1'), true)
        assert.equal(parseBoolFlag('yes'), true)
    })

    it('rejects missing and falsey values', () => {
        assert.equal(parseBoolFlag(undefined), false)
        assert.equal(parseBoolFlag(false), false)
        assert.equal(parseBoolFlag('false'), false)
        assert.equal(parseBoolFlag(''), false)
    })
})

describe('addressIndexArgs', () => {
    it('omits only_vaults unless requested', () => {
        assert.deepEqual(addressIndexArgs('Dabc', false), [{ addresses: ['Dabc'] }])
        assert.deepEqual(addressIndexArgs('Dabc', true), [{ addresses: ['Dabc'] }, true])
        assert.deepEqual(addressIndexArgs('Dabc', true, { asObject: false }), ['Dabc', true])
    })
})

describe('request flags', () => {
    it('reads only_vaults from query or path', () => {
        assert.equal(onlyVaultsFromRequest({ query: { only_vaults: 'true' }, params: {} }), true)
        assert.equal(onlyVaultsFromRequest({ query: {}, params: { only_vaults: 'true' } }), true)
        assert.equal(onlyVaultsFromRequest({ query: {}, params: {} }), false)
    })

    it('reads detailed getcoinavailability from query or path', () => {
        assert.equal(detailedAvailability({ query: { detailed: 'true' }, params: {} }), true)
        assert.equal(detailedAvailability({ query: {}, params: { detailed: 'true' } }), true)
        assert.equal(detailedAvailability({ query: {}, params: {} }), false)
    })
})

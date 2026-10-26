const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { positionalRpcParams } = require('../src/rpc-params')

describe('positionalRpcParams', () => {
    it('drops only unused trailing args', () => {
        assert.deepEqual(
            positionalRpcParams('Ddest', 2, 'standard', 'note', 'bob'),
            ['Ddest', 2, 'standard', 'note', 'bob']
        )
        assert.deepEqual(
            positionalRpcParams('Ddest', 2, 'standard', 'note', undefined),
            ['Ddest', 2, 'standard', 'note']
        )
        assert.deepEqual(
            positionalRpcParams('vault', 'Ddest', 0.1, undefined),
            ['vault', 'Ddest', 0.1]
        )
    })

    it('fills omitted intermediate slots so later values keep position', () => {
        assert.deepEqual(
            positionalRpcParams('Ddest', 2, undefined, undefined, 'bob'),
            ['Ddest', 2, '', '', 'bob']
        )
        assert.deepEqual(
            positionalRpcParams('Ddest', 2, undefined, 'note'),
            ['Ddest', 2, '', 'note']
        )
        assert.deepEqual(
            positionalRpcParams('Ddest', 2, '', 'note', ''),
            ['Ddest', 2, '', 'note']
        )
    })
})

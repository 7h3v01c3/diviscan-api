const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

describe('routing modules', () => {
    it('keeps a single API router and no backups', () => {
        const dir = path.join(__dirname, '../src/routing')
        const names = fs.readdirSync(dir).sort()
        assert.deepEqual(names, ['api.js'])

        const index = fs.readFileSync(path.join(__dirname, '../index.js'), 'utf8')
        assert.match(index, /require\('\.\/src\/routing\/api'\)/)
        assert.doesNotMatch(index, /routing\/(api-2|api-bu|api2|apibu|wallet|tx)/)
    })
})

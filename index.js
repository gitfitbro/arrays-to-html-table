const arrayDiff = require('./diff.js')

const diff = new arrayDiff.ArrayDiff(
  [{ _id: 1, someKey: 'RINGING', meta: { subKey1: 1234, subKey2: 52 } }],
  [
    { _id: 1, someKey: 'HANGUP', meta: { subKey1: 1234 } },
    {
      _id: 2,
      someKey: 'RINGING',
      meta: { subKey1: 5678, subKey2: 207, subKey3: 52 }
    }
  ]
)

diff.getHtmlTable()
// diff.getCsv()

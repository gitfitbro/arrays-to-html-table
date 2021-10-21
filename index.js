const arrayDiff =  require('./diff.js')

arrayDiff.arrayDiffToHtmlTable(  
  [{ _id: 1, someKey: 'RINGING', meta: { subKey1: 1234, subKey2: 52 } }],
  [
    { _id: 1, someKey: 'HANGUP', meta: { subKey1: 1234 } },
    {
      _id: 2,
      someKey: 'RINGING',
      meta: { subKey1: 5678, subKey2: 207, subKey3: 52 }
    }
])

// console.log(arrayDiff.arrayDiffToCsv(  [{ _id: 1, someKey: 'RINGING', meta: { subKey1: 1234, subKey2: 52 } }],
//   [
//     { _id: 1, someKey: 'HANGUP', meta: { subKey1: 1234 } },
//     {
//       _id: 2,
//       someKey: 'RINGING',
//       meta: { subKey1: 5678, subKey2: 207, subKey3: 52 }
//     }
// ]))

// Uncomment to use to test implementation a timer to see how long it takes to run
// arrayDiff.timed(arrayDiff.arrayDiffToHtmlTable)(
//   [{ _id: 1, someKey: 'RINGING', meta: { subKey1: 1234, subKey2: 52 } }],
//   [
//     { _id: 1, someKey: 'HANGUP', meta: { subKey1: 1234 } },
//     {
//       _id: 2,
//       someKey: 'RINGING',
//       meta: { subKey1: 5678, subKey2: 207, subKey3: 52 }
//     }
//   ]
// )
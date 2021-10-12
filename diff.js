const beautify = require('js-beautify')
/**
 * @function arrayDiffToHtmlTable
 * @param {Array} prevArray
 * @param {Array} currArray
 * @returns {String} htmlTable
 **/

module.exports.arrayDiffToHtmlTable = function (prevArray, currArray) {
  // flattens the objects inside of prevArray and currArray
  const flattenPreArray = flattenArray(prevArray)
  const flattenCurrArray = flattenArray(currArray)
  const prevMap = new Map(
    flattenPreArray.map(object => [object._id, object])
  )
  const currentMap = new Map(
    flattenCurrArray.map(object => [object._id, object])
  )
  // We want to have distinct set of ids that are used in both arrays
  const ids = new Set([...prevMap.keys(), ...currentMap.keys()])
  // Create HTML Table with a column header which is a superset of all keys in all the objects in the currArray.
  const columns = getTableColumnValues([...currentMap.values()])
  const htmlTable = generateHtmlTable(columns, currentMap, prevMap, ids)
  // Return formatted HTML Table of flattened objects values
  const formattedHtml = beautify.html(htmlTable, {
    indent_size: 2,
    max_preserve_newlines: 1
  })
  console.log('htmlTable: \n\n', formattedHtml)
  return formattedHtml
}

const timed = f => {
  return function (...args) {
    console.log(`Entering function ${f.name}`)
    let startTime = Date.now()
    try {
      // Pass all arguments to the wrapped function
      return f(...args)
    } finally {
      console.log(
        `Leaving function ${f.name} in ${Date.now() - startTime} milliseconds`
      )
    }
  }
}
// Since we have a map, we do not need to worry about ordering
const flattenArray = target => {
  // flatten the objects
  if (Array.isArray(target) && target.length > 0) {
    return target.map(obj => flattenObject(obj))
  } else {
    return target
  }
}

const flattenObject = (obj, keySeparator = '.', prefix = '') => {
  const flattenRecursive = (obj, parentProperty = '', propertyMap = {}) => {
    for (const [key, value] of Object.entries(obj)) {
      const property = parentProperty.length
        ? parentProperty + keySeparator + key
        : key
      if (value && typeof value === 'object') {
        flattenRecursive(value, property, propertyMap)
      } else {
        propertyMap[property] = value
      }
    }
    return propertyMap
  }
  return flattenRecursive(obj)
}

const merge = (target, ...sources) => {
  for (let source of sources) {
    for (let key in Object.keys(source)) {
      if (!(key in target)) {
        target[key] = source[key]
      }
    }
  }
  return target
}

const getTableColumnValues = array => {
  let columns = []
  mappedArray = array.map(obj => {
    return Object.keys(obj)
  })
  const merged = merge({}, ...mappedArray)
  columns = Object.keys(merged).map(key => merged[key])
  return columns
}

const isChangedValue = (prevArray, currArray, keyValue, id) => {
  let isChanged = {
    changed: false,
    deleted: false,
    added: false
  }
  if (keyValue) {
    // find the object in the maps by id
    const currObj = currArray.get(id)
    const prevObj = prevArray.get(id)
    // if the object is found in the currArray, check if the value has changed
    if (currObj && prevObj) {
      const currValue = currObj[keyValue]
      const prevValue = prevObj[keyValue]
      // if the value has been deleted, set isChanged.deleted to true
      !currValue ? (isChanged.deleted = true) : null
      // if the value has changed, set isChanged.changed to true
      currValue !== prevValue ? (isChanged.changed = true) : null
      // if the value has been added, set isChanged.added to true
      currValue && !prevValue ? (isChanged.added = true) : null
    } else if (currObj && !prevObj) {
      // if the object is found in the currArray, but not in the prevArray, set isChanged.added to true
      isChanged.added = true
    } else if (!currObj && prevObj) {
      // if the object is not found in the currArray, but is found in the prevArray, set isChanged.deleted to true
      isChanged.deleted = true
    }
  }
  return isChanged
}

const generateHtmlTable = (columns, flattenCurrArray, flattenPreArray, ids) => {
  const rows = generateRows(flattenPreArray, flattenCurrArray, columns, ids)
  const styledRows = generateTableRows(rows, columns)

  let htmlTable = `
    ${generateColorTable()}
    <br>
    <table style="width:100%"> 
      ${generateTableHeader(columns)}
      ${styledRows} 
    </table>`
  return htmlTable
}

const generateTableRows = (rows, columns) => {
  let htmlTable = ``
  rows.forEach(row => {
    htmlTable += `<tr>`
    columns.forEach(column => {
      let cell = row[column]
      let isCellChanged =
        cell.changes.added || cell.changes.deleted || cell.changes.changed
      htmlTable += `<td style="font-weight: ${
        isCellChanged ? 'bold' : 'normal'
      }; background-color: ${getColor(cell.changes)}">${cell.value}</td>`
    })
    htmlTable += `</tr>`
  })
  return htmlTable
}

generateTableHeader = columns => {
  let htmlTableCols = `<tr>`
  columns.forEach(column => {
    htmlTableCols += `<th data-column=${column}>${column}</th>`
  })
  htmlTableCols += `</tr>`
  return htmlTableCols
}

const generateRows = (source, target, columns, ids) => {
  let rows = []
  ids.forEach(id => {
    let row = {}
    columns.forEach(column => {
      row[column] = {
        value: !target.get(id)?.[column] ? 'DELETED' : target.get(id)[column],
        changes: isChangedValue(source, target, column, id)
      }
    })
    rows.push(row)
  })
  return rows
}

const getColor = meta => {
  if (meta.changed && meta.deleted) {
    // This is a non-existing value in the target and that has changed in the source
    return '#E1BEE7'
  } else {
    if (meta.changed) {
      return '#B2DFDB'
    } else if (meta.added) {
      return '#C8E6C9'
    } else if (meta.deleted) {
      return '#C2185B'
    }
  }
}

// Generate a table for the meaning of the colors
const generateColorTable = () => {
  let colorTable = `<table style="width:100%"><tr>`
  colorTable += `<th>Color</th>`
  colorTable += `<th>Meaning</th>`
  colorTable += `</tr>`
  colorTable += `<tr>`
  colorTable += `<td style="background-color: #B2DFDB;">#B2DFDB</td>`
  colorTable += `<td>Value has changed</td>`
  colorTable += `</tr>`
  colorTable += `<tr>`
  colorTable += `<td style="background-color: #C8E6C9;">#C8E6C9</td>`
  colorTable += `<td>Value has been added</td>`
  colorTable += `</tr>`
  colorTable += `<tr>`
  colorTable += `<td style="background-color: #C2185B;">#C2185B</td>`
  colorTable += `<td>Value has been deleted</td>`
  colorTable += `</tr>`
  colorTable += `<tr>`
  colorTable += `<td style="background-color: #E1BEE7;">#E1BEE7</td>`
  colorTable += `<td>Non-existing value in the target and that has changed in the source</td>`
  colorTable += `</tr>`
  colorTable += `</table>`
  return colorTable
}

// Uncomment to use to test implementation a timer to see how long it takes to run
timed(module.exports.arrayDiffToHtmlTable)(
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

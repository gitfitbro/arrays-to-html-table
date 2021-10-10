/**
 * @function arrayDiffToHtmlTable
 * @param {Array} prevArray
 * @param {Array} currArray
 * @returns {String} htmlTable
 * TODO: Move most of these comments to a README.md file
 *
 * The function will take two arguments
 * [x] (prevArray, currArray)
 * [x] flattens the objects inside of prevArray and currArray to 1 level of depth,
 * [x] Returns an HTML Table of the values.
 *
 * HTML Table
 * [x] The HTML table you return has a column header which is a superset of all keys in all the objects in the currArray.
 * [x] Any values that have changed from the prevArray to the currArray (ie field value changed or is a new key altogether) should be bolded
 * [] In the case that the value has been removed altogether from the prevArray to the currArray, you will write out the key in bold DELETED.
 *
 * RULES:
 * The arrays are arbitrarily deep
 * The currArray could have more or potentially even be in a different index order
 * You cannot depend solely on array index for comparison
 * you can assume that each object in the arrays will have an "_id" parameter
 *   -> Unless the currArray has no object with the matching "_id" parameter (for example if the whole row has changed)
 *  Do not create global scope
 *  We have a test runner that will iterate on your function and run many fixtures through it
 * --> If you create global scope for 1 individual diff between prevArray to currArray you could cause other tests to fail
 **/

module.exports.arrayDiffToHtmlTable = function (prevArray, currArray) {
  // flattens the objects inside of prevArray and currArray
  const flattenPreArray = sortAndFlatten(prevArray)
  const flattenCurrArray = sortAndFlatten(currArray)
  // Create HTML Table with a column header which is a superset of all keys in all the objects in the currArray.
  const columns = getTableColumnValues(flattenCurrArray)
  const htmlTable = generateHtmlTable(
    columns,
    flattenCurrArray,
    flattenPreArray
  )
  // Return HTML Table of flattened objects values
  console.log('htmlTable: ', htmlTable)
  return htmlTable
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

// For performance reasons, we want to sort the objects in the array by their _id
const sortAndFlatten = (target) => {
  // sort the array by _id
  // flatten the objects
  if (Array.isArray(target) && target.length > 0) {
    return target
      .sort((a, b) => a._id - b._id)
      .map(obj => flattenObject(obj))
  } else {
    return target
  }
}

const flattenObject = (obj, keySeparator = '.', prefix = '') => {
  const flattenRecursive = (obj, parentProperty = '', propertyMap = {}) => {
    for (const [key, value] of Object.entries(obj)) {
      const property = parentProperty.length ? parentProperty + keySeparator + key : key
      if (value && typeof value === 'object') {
        flattenRecursive(
          value,
          property,
          propertyMap
        )
      } else {
        propertyMap[
          property
        ] = value
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
    // find the object in the currArray with the matching id
    const currObj = currArray.find(obj => obj['_id'] === id)
    // find the object in the prevArray with the matching id
    const prevObj = prevArray.find(obj => obj['_id'] === id)
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

const generateHtmlTable = (columns, flattenCurrArray, flattenPreArray) => {
  let htmlTable = `
  ${generateColorTable()}
  <br>
  <table style="width:100%"><tr>`
  // Loop through the columns and update the table
  columns.forEach(column => {
    htmlTable += `<th data-column=${column}>${column}</th>`
  })
  htmlTable += `</tr>`
  // Add rows to the table for each value in flattenCurrArray
  flattenCurrArray.forEach(rowValue => {
    htmlTable += `<tr>`
    columns.forEach(key => {
      let keyChangeMeta = isChangedValue(
        flattenPreArray,
        flattenCurrArray,
        key,
        rowValue._id
      )
      let keyChange =
        keyChangeMeta.changed || keyChangeMeta.added || keyChangeMeta.deleted
      if (keyChange) {
        htmlTable += `<td style="background-color: ${getColor(
          keyChangeMeta
        )}; font-weight: bold;">${
          keyChangeMeta.deleted || !rowValue?.[key] ? 'DELETED' : rowValue[key]
        }</td>`
      } else {
        htmlTable += `<td style="background-color: ${getColor(
          keyChangeMeta
        )};">${
          keyChangeMeta.deleted || !rowValue?.[key] ? 'DELETED' : rowValue[key]
        }</td>`
      }
    })

    htmlTable += `</tr>`
  })
  htmlTable += `</table>`
  return htmlTable
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

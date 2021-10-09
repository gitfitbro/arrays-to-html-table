
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

module.exports.arrayDiffToHtmlTable = function( prevArray, currArray) {
  // flattens the objects inside of prevArray and currArray
  const flattenPreArray = prevArray.map(obj => flattenObject(obj))
  const flattenCurrArray = currArray.map(obj => flattenObject(obj))
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

const flattenObject = (obj, keySeparator = '.', prefix = '') => {
  const flattenRecursive = (obj, parentProperty = '', propertyMap = {}) => {
    for(const [key, value] of Object.entries(obj)){
      const pre = prefix.length ? prefix + '.' : '';
      const property = parentProperty ? `${parentProperty}${keySeparator}${key}` : key;
      if(value && typeof value === 'object'){
        flattenRecursive(value, parentProperty.length ? parentProperty + '.' + key : key, propertyMap);
      } else {
        propertyMap[parentProperty.length ? parentProperty + '.' + key : key] = value;
      }
    }
    return propertyMap;
  };
  return flattenRecursive(obj);
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

const isValidObj = obj => {
  // TODO: Potentially add more validation checks
  let isValid = false
  if (obj && Object.keys(obj).length > 0) {
    isValid = true
  }
  return isValid
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

const getDiff = (prevArray, currArray) => {
  const flattenPreArray = flattenObject(prevArray)
  const flattenCurrArray = flattenObject(currArray)
  // Get values that have changed between the two arrays
  const diff = {}
  Object.keys(flattenCurrArray).forEach(key => {
    if (flattenPreArray[key] != flattenCurrArray[key]) {
      diff[key] = flattenCurrArray[key]
    }
  })
  return Object.keys(diff)
}

const getRemovedKeys = (prevArray, currArray) => {
  const flattenPreArray = flattenObject(prevArray)
  const flattenCurrArray = flattenObject(currArray)
  // Get values that have been deleted from flattenPreArray to flattenCurrArray
  const removedKeys = []
  Object.keys(flattenPreArray).forEach(key => {
    if (!flattenCurrArray[key]) {
      removedKeys.push(key)
    }
  })
  return removedKeys
}

const isChangedValue = (prevArray, currArray, keyValue) => {
  let isChanged = {
    bold: false,
    deleted: false
  }
  if (keyValue) {
    const changedProperties = getDiff(prevArray, currArray)
    let isValueChanged = changedProperties.some(changedProperty => {
      return changedProperty.includes(keyValue)
    })
    isChanged.bold = isValueChanged
    let isValueDeleted = getRemovedKeys(prevArray, currArray).some(key =>
      keyValue.includes(key)
    )
    isChanged.deleted = isValueDeleted
  }
  return isChanged
}

const generateHtmlTable = (columns, flattenCurrArray, flattenPreArray) => {
  let htmlTable = `<table style="width:100%"><tr>`
  // Loop through the columns and update the table
  columns.forEach(column => {
    htmlTable += `<th data-column=${column}>${column}</th>`
  })
  htmlTable += `</tr>`
  // Add rows to the table for each value in flattenCurrArray
  flattenCurrArray.forEach(rowValue => {
    htmlTable += `<tr>`
    columns.forEach(key => {
      let changedProperties = getDiff(flattenPreArray, flattenCurrArray)
      let changedVal = changedProperties.some(changedProperty => {
        changedProperty.indexOf(key) !== -1
      })
      let keyChangeMeta = isChangedValue(flattenPreArray, flattenCurrArray, key)
      // Any values that have changed from the flattenPreArray to the flattenCurrArray (ie field value changed or is a new key altogether) should be bolded.
      // In the case that the value has been removed altogether from the prevArray to the currArray, you will write out the key in bold DELETED.
      htmlTable += `<td style="font-weight: ${
        (keyChangeMeta.bold || changedProperties.includes(key)) ? 'bold' : 'normal'
      };">${
        (keyChangeMeta.deleted || !rowValue?.[key]) ? 'DELETED' : rowValue[key]
      }</td>`
    })
    htmlTable += `</tr>`
  })
  htmlTable += `</table>`
  return htmlTable
}

// Uncomment to use to test implementation a timer to see how long it takes to run
// timed(module.exports.arrayDiffToHtmlTable)(
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

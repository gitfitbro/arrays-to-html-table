const beautify = require('js-beautify')
const buff = require('buffer')

/**
 * @Class ArrayDiff
 * @description The class allows to compare two arrays and return the difference between them.
 * @param {Array} source - The first array to compare.
 * @param {Array} target - The second array to compare.
 */
class ArrayDiff {
  constructor (source, target) {
    this.source = source
    this.target = target
  }

  getHtmlTable () {
    return this.arrayDiffToHtmlTable(this.source, this.target)
  }

  getCsv () {
    return this.arrayDiffToCsv(this.source, this.target)
  }

  arrayDiffToHtmlTable (source, target) {
    const { ids, columns, rows } = this.getDiffMetadata(source, target)
    const htmlTable = this.generateHtmlTable(columns, rows, ids)
    // Return formatted HTML Table of flattened objects values
    return htmlTable
  }

  arrayDiffToCsv (source, target) {
    const { ids, columns, rows } = this.getDiffMetadata(source, target)
    // how null values should be handled
    const replacer = (key, value) => (value === null ? '' : value)
    const header = columns.join(',')

    const csv = [
      header,
      ...rows.map(row => {
        return Object.keys(row)
          .map(field => {
            return JSON.stringify(row[field].value, replacer)
          })
          .join(',')
      })
    ].join('\r\n')
    return csv
  }

  getDiffMetadata (source, target) {
    // flattens the objects inside of prevArray and currArray
    const sourceMap = source.length > 0 ? this.getFlattenedMap(source) : {}
    const targetMap = target.length > 0 ? this.getFlattenedMap(target) : {}
    // We want to have distinct set of ids that are used in both arrays
    const ids = this.getDistinctIds(sourceMap, targetMap)
    // Create HTML Table with a column header which is a superset of all keys in all the objects in the currArray.
    const columns = this.getTableColumnValues([...targetMap.values()])
    const rows = this.generateRows(targetMap, targetMap, columns, ids)
    return {
      ids,
      columns,
      rows
    }
  }

  getDistinctIds (source, target) {
    const ids = new Set([...source.keys(), ...target.keys()])
    return ids
  }

  getFlattenedMap (arr) {
    const flattenedArray = this.flattenArray(arr)
    const map = new Map(flattenedArray.map(object => [object._id, object]))
    return map
  }

  timed (f) {
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
  flattenArray (target) {
    // flatten the objects
    if (Array.isArray(target) && target.length > 0) {
      return target.map(obj => this.flattenObject(obj))
    } else {
      return target
    }
  }

  flattenObject (obj, keySeparator = '.', prefix = '') {
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

  merge (target, ...sources) {
    for (let source of sources) {
      for (let key in Object.keys(source)) {
        if (!(key in target)) {
          target[key] = source[key]
        }
      }
    }
    return target
  }

  getTableColumnValues (array) {
    let columns = []
    const mappedArray = array.map(obj => {
      return Object.keys(obj)
    })
    const merged = this.merge({}, ...mappedArray)
    columns = Object.keys(merged).map(key => merged[key])
    return columns
  }

  isChangedValue (prevArray, currArray, keyValue, id) {
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

  generateHtmlTable (columns, rows, ids) {
    const styledRows = this.generateTableRows(rows, columns)

    const htmlTable = `
      ${this.generateColorTable()}
      <br>
      <table style="width:100%"> 
        ${this.generateTableHeader(columns)}
        ${styledRows} 
      </table>`
    // Format the HTML Table
    return this.buildHtml(htmlTable)
  }

  buildHtml (table) {
    const header = `<head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flattened Arrays To Table</title>
        <style>
          body {
            width:50%; 
            margin: 0 auto; 
            padding: 50px;
          }
          table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
          }
        </style>
      </head>`

    const html =
      '<!DOCTYPE html>' +
      '<html><head>' +
      header +
      '</head><body>' +
      table +
      '</body></html>'
    const formattedHtml = beautify.html(html, {
      indent_size: 2,
      max_preserve_newlines: 1
    })
    console.log(formattedHtml)
    return formattedHtml
  }

  generateTableRows (rows, columns) {
    let htmlTable = ``
    rows.forEach(row => {
      htmlTable += `<tr>`
      columns.forEach(column => {
        let cell = row[column]
        let isCellChanged =
          cell.changes.added || cell.changes.deleted || cell.changes.changed
        htmlTable += `<td style="font-weight: ${
          isCellChanged ? 'bold' : 'normal'
        }; background-color: ${this.getColor(cell.changes)}">${cell.value}</td>`
      })
      htmlTable += `</tr>`
    })
    return htmlTable
  }

  generateTableHeader (columns) {
    let htmlTableCols = `<tr>`
    columns.forEach(column => {
      htmlTableCols += `<th data-column=${column}>${column}</th>`
    })
    htmlTableCols += `</tr>`
    return htmlTableCols
  }

  generateRows (source, target, columns, ids) {
    let rows = []
    ids.forEach(id => {
      let row = {}
      columns.forEach(column => {
        row[column] = {
          value: !target.get(id)?.[column]
            ? column !== '_id'
              ? 'DELETED'
              : id
            : target.get(id)[column],
          changes: this.isChangedValue(source, target, column, id)
        }
      })
      rows.push(row)
    })
    return rows
  }

  getColor (meta) {
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
  generateColorTable () {
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
}

module.exports = {
  ArrayDiff
}

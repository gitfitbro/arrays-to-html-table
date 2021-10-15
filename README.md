# arrays-to-html-table

---

**Development Tasks:**

* [x] TODO: Move most of these comments to a README.md file
* [x] TODO: Create a Set of _ids for currArray and PrevArray
* [x] TODO: Use the Set() and Map() Classes
* [x] TODO: Beautify the html
* [x] TODO: Create a file with the resulting html
* [x] TODO: Updated table generation to include the id of a row that was delete completely
* [ ] TODO: Test large arrays (e.g. > 10,000)
* [ ] TODO: Add Unit Tests
* [ ] TODO: Split HTML function into separate module
* [ ] TODO: Export as csv
* [ ] TODO: Export as JSON
* [ ] TODO: Export as PDF

---

* [x]  (prevArray, currArray)
* [x] flattens the objects inside of prevArray and currArray to 1 level of depth,
* [x] Returns an HTML Table of the values.

---

**HTML Table:**

* [x] The HTML table you return has a column header which is a superset of all keys in all the objects in the currArray.
* [x] Any values that have changed from the prevArray to the currArray (ie field value changed or is a new key altogether) should be bolded
* [x] In the case that the value has been removed altogether from the prevArray to the currArray, you will write out the key in bold DELETED.

---

**RULES:**

* The arrays are arbitrarily deep
* The currArray could have more or potentially even be in a different index order
* You cannot depend solely on array index for comparison
* you can assume that each object in the arrays will have an "_id" parameter
  * Unless the currArray has no object with the matching "_id" parameter (for example if the whole row has changed)
* Do not create global scope
* We have a test runner that will iterate on your function and run many fixtures through it
  * If you create global scope for 1 individual diff between prevArray to currArray you could cause other tests to fail

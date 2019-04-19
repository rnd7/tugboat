

const UNSIGNED_INTEGER = {
  test: (value) => {
    return /^(?:0|[1-9]\d*)$/.test(value)
  },
  parse: parseInt
}
const INTEGER = {
  test: (value) => {
    return /^-?(?:0|[1-9]\d*)$/.test(value)
  },
  parse: parseInt
}
const NUMBER = {
  test: (value) => {
    return /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value)
  },
  parse: parseFloat
}

const RANGE =  {
  test: (value) => {
    return /^(-?(?:0|[1-9]\d*))-(-?(?:0|[1-9]\d*))?$/.test(value)
  },
  parse: (str) => {
    let result = str.match(/^(-?(?:0|[1-9]\d*))-(-?(?:0|[1-9]\d*))?$/)
    let start = parseInt(result[1])
    let end = -1
    if (result[2] !== undefined) end =  parseInt(result[2])
    return { start, end }
  }
}

const PARENT =  {
  test:  (value) => {
    return /^\.{2,2}$/.test(value)
  },
  parse: (str) => { return str }
}

const NAME = {
  test:  (value) => {
    return /^\S+$/.test(value)
  },
  parse: (str) => { return str }
}

const WILDCARD = {
  test: (value) => {
    return /^\*$/.test(value)
  },
  parse: (str) => { return str }
}

const PERSIST = {
  test: (value) => {
    return /^\$.*$/.test(value)
  },
  parse: (str) => {
    let result = str.match(/^\$(.+)$/)
    if (!result) return
    let group = result[1]
    return group
  }
}

const SLASH = {
  test: (value) => {
    return /^\/$/.test(value)
  },
  parse: (str) => { return str }
}

const DELIMITER = {
  test: (value) => {
    return /^\n$/.test(value)
  },
  parse: (str) => { return str }
}

const NEQUALS = {
  test:(value) => {
    return /^!=.+$/.test(value)
  },
  parse:(str) => {
    let result = str.match(/^!=(.+)$/)
    let expression = result[1]
    let mode = "unknown"
    let params
    if (INTEGER.test(expression)) {
      mode = "integer"
      params = INTEGER.parse(expression)
    } else if(REGEXP.test(expression)) {
      mode = "regexp"
      params = REGEXP.parse(expression)
    } else if(STRING.test(expression)) {
      mode = "string"
      params = expression.replace(/"/g,'')
    }
    return { mode, params }
  }
}

const EQUALS = {
  test: (value) => {
    return /^=.+$/.test(value)
  },
  parse: (str) => {
    let result = str.match(/^=(.+)$/)
    let expression = result[1]
    let mode = "unknown"
    let params
    if (INTEGER.test(expression)) {
      mode = "integer"
      params = INTEGER.parse(expression)
    } else if(REGEXP.test(expression)) {
      mode = "regexp"
      params = REGEXP.parse(expression)
    } else if(STRING.test(expression)) {
      mode = "string"
      params = expression.replace(/"/g,'')
    }
    return { mode, params }
  }
}


const REGEXP = {
  test: (value) => {
    return /^\/.+\/i?$/.test(value)
  },
  parse: (str) => {
    let result = str.match(/^\/(.+)\/(i)?$/)
    let pattern = result[1]
    let flags = ""
    if (result[2] !== undefined) flags = result[2]
    return { pattern, flags }
  }
}

const STRING = {
  test: (value) => {
    return /^".+"$/.test(value)
  },
  parse: (str) => { return str }
}



/*
  ranges:
  0- all elements
  0-12 all elements including 13th
  14-5 the 14th element to the 5th
  -1- the last element only
  -12--32 20 elements reverse beginning at the 12th last element
*/
function parseSelector(selector) {
  let index = 0
  let result = []
  let buffer = ""
  function flush() {
    if (buffer.length == 0) return
    let obj = {
       type:"unknown",
       buffer,
       index: index-1-buffer.length,
       length: buffer.length,
    }
    if (WILDCARD.test(buffer)) {
      obj.type = "wildcard"
    } else if (PARENT.test(buffer)) {
      obj.type = "parent"
    } else if (NEQUALS.test(buffer)) {
      obj.type = "nequals"
      obj.value = NEQUALS.parse(obj.buffer)
    }  else if (EQUALS.test(buffer)) {
      obj.type = "equals"
      obj.value = EQUALS.parse(obj.buffer)
    }  else if (PERSIST.test(buffer)) {
      obj.type = "persist"
      obj.value = PERSIST.parse(obj.buffer)
    } else if (RANGE.test(buffer)) {
      obj.type = "range"
      obj.value = RANGE.parse(obj.buffer)
    } else if (REGEXP.test(buffer)) {
      obj.type = "regexp"
      obj.value = REGEXP.parse(obj.buffer)
    } else if (INTEGER.test(buffer)) {
      obj.type = "integer"
      obj.value = INTEGER.parse(obj.buffer)
    } else if (NAME.test(buffer)) {
      obj.type = "name"
      obj.value = NAME.parse(obj.buffer)
    }
    result.push(obj)
    buffer = ""
  }
  while (index<selector.length) {
    let chr = selector[index++]
    if (DELIMITER.test(chr)) {
      flush()
    } else {
      buffer += chr
    }
  }
  flush()
  return result;
}

let inputElem = document.querySelector("#input")
inputElem.value = JSON.stringify({
  key: "value",
  array: [
    {
      type: "sometype",
      value: 1
    },
    {
      type: "sometype",
      value: 2
    },
    {
      type: "sometype",
      value: 3
    },
    {
      type: "othertype",
      value: "grandma",
    }
  ],
  nested: {
    someSettings: {
      buttonSize: 13,
      buttonColor: "#123456",
      buttonLabel: "Click me"
    },
    otherSettings: {
      flip: true,
      change: false
    }
  }
}, null, 2)

let data = null
inputElem.addEventListener('input', (e) => {
  parseInput()
  applySelector()
})

function parseInput() {
  try {
    data = JSON.parse(inputElem.value)
    inputElem.style.backgroundColor = null;
  } catch(e) {
    inputElem.style.backgroundColor = "#EE88"
  }
}

parseInput()

let outputElem = document.querySelector("#output")
let selectorElem = document.querySelector("#selector")
selectorElem.value = 'array\n1-4\n/type/\n\=/type/\n="sometype"\n..\nvalue'

selectorElem.addEventListener('input', (e) => {
  applySelector()
})

function makePathString(path) {
  let str = ""
  for (var i = 0; i<path.length; i++) {
    let n = path[i]
    if (typeof n === "number") str += "["+n+"]"
    else str += (i>0)?"."+n:n
  }
  return str
}

function mapResults(results) {
  let out = {}
  results.forEach((result) => {
    out[result.pathString] = result.value
  })
  return out
}

function applySelector() {
  let str = selectorElem.value
  let selector = parseSelector(str)
  let results = []
  select(selector, data, results)
  let out = mapResults(results)
  outputElem.value = JSON.stringify(out, null, 2)
  console.log(results)
}
applySelector()

function select(selectors, pointer, results, existing, path, traversed) {

  if (!path) path = []
  if (!traversed) traversed = []
  if (!existing) existing = {}
  //console.log("SELECT", traversed)
  let pointerType = typeof pointer
  if (pointerType === "object") {
    if (pointer === null) pointerType = "null"
    else if (pointer instanceof Array) pointerType = "array"
  }
  let selector = selectors[0]
  if (!selector) {
    //console.log("SELECTED", path, pointer)
    let p = makePathString(path)
    if (!existing.hasOwnProperty(p)){
      existing[p] = true
      results.push({
        value: pointer,
        pathString: p,
        path,
        type: pointerType
      })
    }
  } else if (selector.type == "store") {
    console.log("store", selector.value, path[path.length-1])
    select(selectors.slice(1), pointer, results, existing, [...path], [].concat(traversed))
  } else if (selector.type == "persist") {
    console.log("store", selector.value, path[path.length-1])
    let p = makePathString(path)
    if (!existing.hasOwnProperty(p)){
      existing[p] = true
      results.push({
        value: pointer,
        pathString: p,
        path,
        type: pointerType,
        group: selector.value
      })
    }
    select(selectors.slice(1), pointer, results, existing, [...path], [].concat(traversed))
  } else if (selector.type == "parent") {
    let parent = traversed.pop()
    path.pop()
    select(selectors.slice(1), parent, results, existing, path, [].concat(traversed))
  } else {
      //console.log("pointerType",pointerType)
      switch (pointerType) {
        case "array":
          traversed.push(pointer)
          //console.log("isarray")
          if (selector.type == "integer") {
            let index = selector.value
            select(selectors.slice(1), pointer[index], results, existing, [...path,index], [].concat(traversed))
          } else if (selector.type == "range") {
            let len = pointer.length
            let a = selector.value.start
            let b = selector.value.end
            //console.log("!!!", a,b)
            if (a<0) a += len
            if (b<0) b += len
            //console.log("!!!2", a,b)
            a = Math.max(0, Math.min(len-1, a))
            b = Math.max(0, Math.min(len-1, b))
            //console.log("!!!3", a,b)
            if (a<b) {
              for (let  i = a; i<=b; i++) {
                select(selectors.slice(1), pointer[i], results, existing, [...path,i], [].concat(traversed))
              }
            } else {
              for (let  i = a; i>=b; i--) {
                select(selectors.slice(1), pointer[i], results, existing, [...path,i], [].concat(traversed))
              }
            }
          } else if (selector.type == "wildcard") {
            for (let  i = 0; i<pointer.length; i++) {
              select(selectors.slice(1), pointer[i], results, existing, [...path,i], [].concat(traversed))
            }
          }
          break;
        case "object":
          traversed.push(pointer)
          if(selector.type == "name") {
            if (pointer.hasOwnProperty(selector.value)){
              let key = selector.value
              select(selectors.slice(1), pointer[key], results, existing, [...path,key], [].concat(traversed))
            }
          } else if (selector.type == "regexp") {
            let keys = Object.keys(pointer)
            for (let  i = 0; i<keys.length; i++) {
              const key = keys[i]
              if (new RegExp(selector.value.pattern, selector.value.flag).test(key)) {
                select(selectors.slice(1), pointer[key], results, existing, [...path,key], [].concat(traversed))
              }
            }
          } else if (selector.type == "wildcard") {
            let keys = Object.keys(pointer)
            for (let  i = 0; i<keys.length; i++) {
              const key = keys[i]
              select(selectors.slice(1), pointer[key], results, existing, [...path,key], [].concat(traversed))
            }
          }

          break;
        case "string":
        case "number":
        case "integer":
        case "date":
        case "boolean":
          if (selector.type == "nequals") {
            if (selector.value.mode === "string") {
              if (pointer !== selector.value.params) {
                select(selectors.slice(1), pointer, results, existing, [...path], [].concat(traversed))
              }
            } else if (selector.value.mode === "integer") {
              if (pointer != selector.value.params) {
                select(selectors.slice(1), pointer, results, existing, [...path], [].concat(traversed))
              }
            } else if (selector.value.mode === "regexp") {
              if (!(new RegExp(selector.value.params.pattern, selector.value.params.flags).test(pointer))) {
                select(selectors.slice(1), pointer, results, existing, [...path], [].concat(traversed))
              }
            }
          } else if (selector.type == "equals") {
            if (selector.value.mode === "string") {
              if (pointer === selector.value.params) {
                select(selectors.slice(1), pointer, results, existing, [...path], [].concat(traversed))
              }
            } else if (selector.value.mode === "integer") {
              if (pointer == selector.value.params) {
                select(selectors.slice(1), pointer, results, existing, [...path], [].concat(traversed))
              }
            } else if (selector.value.mode === "regexp") {
              if (new RegExp(selector.value.params.pattern, selector.value.params.flags).test(pointer)) {
                select(selectors.slice(1), pointer, results, existing, [...path], [].concat(traversed))
              }
            }
          } else {
            let p = makePathString(path)
            if (!existing.hasOwnProperty(p)){
              results.push({
                value: pointer,
                pathString: p,
                path,
                type: pointerType
              })
            }
          }
          break;
        case "null":
          break;
      }
    }
  }

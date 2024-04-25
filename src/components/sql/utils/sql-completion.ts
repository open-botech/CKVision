import * as monaco from 'monaco-editor'
const hints = [
  'SELECT',
  'INSERT',
  'DELETE',
  'UPDATE',
  'CREATE TABLE',
  'DROP TABLE',
  'ALTER TABLE',
  'CREATE VIEW',
  'DROP VIEW',
  'CREATE INDEX',
  'DROP INDEX',
  'CREATE PROCEDURE',
  'DROP PROCEDURE',
  'CREATE TRIGGER',
  'DROP TRIGGER',
  'CREATE SCHEMA',
  'DROP SCHEMA',
  'CREATE DOMAIN',
  'ALTER DOMAIN',
  'DROP DOMAIN',
  'GRANT',
  'DENY',
  'REVOKE',
  'COMMIT',
  'ROLLBACK',
  'SET TRANSACTION',
  'DECLARE',
  'EXPLAN',
  'OPEN',
  'FETCH',
  'CLOSE',
  'PREPARE',
  'EXECUTE',
  'DESCRIBE',
  'FORM',
  'ORDER BY',
]

function getSuggestionItem(item: any) {
  return {
    label: item.name,
    kind: monaco.languages.CompletionItemKind.Constant,
    documentation: item.name,
    insertText: item.name,
  }
}

const columnsWantedKeyword = ['select', 'where', 'group', 'having', 'on']

const tableWantedKeyword = ['from', 'join']

function createCompleter(getExtraHints: any, tables: any[] = [], columns: any[]) {
  // [...hints, ...databaseHints]
  const hasDatabaseHints = [...hints, ...tables.map((item) => item.database)]
  const createSuggestions = function (model: any, textUntilPosition: any, ...rest: any) {
    const textCurrent = model.getValue()
    const textNoSpecial = textUntilPosition.replace(/[\*\[\]@\$\(\)]/g, '')
    const textUntilPositionLower = textUntilPosition.toLowerCase()

    const textHasSpot = textNoSpecial.replace(/(\s+)/g, ' ')
    const HasSpotTextArr = textHasSpot.split(/[\s;]/)
    const hasSpotActiveStr = HasSpotTextArr[HasSpotTextArr.length - 1]

    const keywordsRegex = /\b(from|join|select|where|group|having|on)\b/gi
    const tableRegex = new RegExp(`\\b(${tables.map((item) => item.name).join('|')})\\b`, 'gi')

    const allTokens = [...new Set(textCurrent.toLowerCase().match(tableRegex))]

    const mostRecentKeyword = textUntilPositionLower.match(keywordsRegex)?.pop()
    let wanted
    let priorKeyword
    if (mostRecentKeyword) {
      if (columnsWantedKeyword.includes(mostRecentKeyword)) {
        priorKeyword = mostRecentKeyword
        wanted = 'COLUMN'
      }
      if (tableWantedKeyword.includes(mostRecentKeyword)) {
        priorKeyword = mostRecentKeyword
        wanted = 'TABLE'
      }
    }

    const hasDot = hasSpotActiveStr.includes('.')

    const database = [...new Set(tables.map((item) => item.database))]
      .filter((item) => item.includes(hasSpotActiveStr))
      .map((item) => {
        return {
          label: item,
          kind: monaco.languages.CompletionItemKind.Constant,
          documentation: item,
          insertText: item,
        }
      })
    const showTables = tables
      .filter((item) => item.name.includes(hasSpotActiveStr))
      .map((item) => getSuggestionItem(item))

    const defaultSuggestion = [...database, ...showTables]

    if (!hasDot && wanted === 'TABLE') {
      return defaultSuggestion
    }

    if (!hasDot && wanted === 'COLUMN') {
      if (priorKeyword === 'select') {
        return defaultSuggestion
      } else {
        const tableByAlreadyShow = tables.filter((item) => {
          return allTokens.includes(item.name)
        })
        const columnsByAlreadyShow = columns.filter((item) => {
          return allTokens.includes(item.table)
        })
        return [
          ...tableByAlreadyShow.map((item) => getSuggestionItem(item)),
          ...columnsByAlreadyShow.map((item) => getSuggestionItem(item)),
        ]
      }
    }

    if (hasDot && wanted === 'COLUMN') {
      const dotStrArr = hasSpotActiveStr.split('.')
      const last = dotStrArr[dotStrArr.length - 1]
      const lastlast = dotStrArr[dotStrArr.length - 2]
      const database = tables.filter((item) => item.database === lastlast)
      const tablesByName = tables.find((item) => item.name === lastlast)
      if (database.length) {
        let returnData = database
        if (last) {
          returnData = database.filter((item) => item.name.includes(last))
        }
        return returnData.map((item) => {
          return getSuggestionItem(item)
        })
      }
      if (tablesByName) {
        let returnData = columns.filter((item) => item.table === lastlast)
        if (last) {
          returnData = returnData.filter((item) => item.name.includes(last))
        }
        return returnData.map((item) => {
          return getSuggestionItem(item)
        })
      }
      return []
    }

    if (hasDot && wanted === 'TABLE') {
      const dotStrArr = hasSpotActiveStr.split('.')
      const last = dotStrArr[dotStrArr.length - 1]
      const lastlast = dotStrArr[dotStrArr.length - 2]
      const database = tables.filter((item) => item.database === lastlast)
      if (database.length) {
        let returnData = database
        if (last) {
          returnData = database.filter((item) => item.name.includes(last))
        }
        return returnData.map((item) => {
          return getSuggestionItem(item)
        })
      }
      return []
    }
    const testNoSpot = textNoSpecial.replace(/(\s+|\.)/g, ' ')
    const noSpotTextArr = testNoSpot.split(/[\s;]/)
    const noSpotActiveStr = noSpotTextArr[noSpotTextArr.length - 1]
    const len = noSpotActiveStr.length
    const rexp = new RegExp('([^\\w]|^)' + noSpotActiveStr + '\\w*', 'gim')
    const match = textCurrent.match(rexp)
    const textHints = !match
      ? []
      : match.map((ele: any) => {
          const rexp = new RegExp(noSpotActiveStr, 'gim')
          const search = ele.search(rexp)
          return ele.substr(search)
        })
    const mergeHints = Array.from(
      new Set([...hasDatabaseHints, ...textHints, ...getExtraHints(model)]),
    )
      .sort()
      .filter((ele) => {
        const rexp = new RegExp(ele.substr(0, len), 'gim')
        return (match && match.length === 1 && ele === noSpotActiveStr) || ele.length === 1
          ? false
          : noSpotActiveStr.match(rexp)
      })
    return mergeHints.map((ele) => ({
      label: ele,
      kind:
        hasDatabaseHints.indexOf(ele) > -1
          ? monaco.languages.CompletionItemKind.Keyword
          : monaco.languages.CompletionItemKind.Text,
      documentation: ele,
      insertText: ele,
    }))
  }

  return {
    triggerCharacters: ['.'],
    provideCompletionItems(model: any, position: any) {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })
      return {
        suggestions: createSuggestions(model, textUntilPosition),
      }
    },
  }
}
export default createCompleter

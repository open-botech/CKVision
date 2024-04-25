function getRequestUrl(connection, settings) {
  if (!connection) {
    throw new Error('No Connection')
  }
  const httpProto = connection.connectionUrl.indexOf('//') === -1 ? 'http://' : ''

  let url = `${httpProto}${connection.connectionUrl}`
  // add /?
  url = `${url}/?output_format_json_quote_denormals=1&output_format_json_quote_64bit_integers=1&log_queries=1&enable_http_compression=1&add_http_cors_header=1&result_overflow_mode=throw&timeout_overflow_mode=throw&max_execution_time=10&max_result_rows=90000&max_result_bytes=10000000`
  if (connection.password) {
    url += `&user=${encodeURIComponent(connection.username)}&password=${encodeURIComponent(
      connection.password,
    )}`
  } else {
    url += `&user=${encodeURIComponent(connection.username)}`
  }

  if (settings) {
    url += settings
  }

  return url
}

function request(request, init) {
  return fetch(request, init)
    .then((response) => {
      const contentType = response.headers.get('content-type')
      if (
        contentType &&
        response.status === 200 &&
        response.statusText.toLowerCase() === 'ok' &&
        (contentType.includes('text/plain') ||
          contentType.includes('application/xml') ||
          contentType.includes('text/csv') ||
          contentType.includes('text/tab-separated-values'))
      ) {
        // if create table && drop table
        return Promise.resolve(response.text())
      }
      if (
        contentType &&
        contentType.includes('application/json') &&
        response.status >= 200 &&
        response.status < 300
      ) {
        return response.json()
      }
      return response.text().then(Promise.reject.bind(Promise)) // refactor ???
    })
    .then(
      (response) => {
        if (response === 'OK' || !response) {
          return 'OK'
        }
        return response
      },
      // refactor: use catch
      (responseBody) => Promise.reject(responseBody),
    )
}

function getRequestInit(query) {
  const init = {
    mode: 'cors',
    method: 'post',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept-Encoding': 'gzip',
    },
    body: query,
    // credentials: 'include', // Error : The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
  }
  return init
}

// const url = getRequestUrl(connectionData, settings)

const queryAllColumns = (connection) => {
  const sql = `SELECT * FROM system.columns

    LIMIT 50000

  FORMAT JSON`
  const init = getRequestInit(sql)
  const url = getRequestUrl(connection, connection.params)

  return request(url, init).then((res) => {
    return res
  })
}

const queryAllDatabases = (connection) => {
  const sql = `SELECT name FROM system.databases LIMIT 10000
  FORMAT JSON`

  const init = getRequestInit(sql)
  const url = getRequestUrl(connection, connection.params)

  return request(url, init).then((res) => {
    return res
  })
}

const queryAllTables = (connection) => {
  const sql = `SELECT t.database,
        t.name,
        t.engine,
        -- t.*,
        pa.size
    FROM system.tables as t ANY LEFT JOIN ( SELECT database,table as name,formatReadableSize(sum(bytes)) as size FROM system.parts  GROUP BY database,name ) as pa USING (database,name)
    LIMIT 10000

    FORMAT JSON`

  const init = getRequestInit(sql)
  const url = getRequestUrl(connection, connection.params)

  return request(url, init).then((res) => {
    return res
  })
}

const createTree = (columns, tables, database, connection) => {
  const tablesTree = tables.map((item) => {
    const children = columns.filter((col) => col.table === item.name)
    return {
      ...item,
      children,
    }
  })

  const databaseTree = database.map((item) => {
    const children = tablesTree.filter((table) => table.database === item.name)
    return {
      ...item,
      children,
    }
  })

  const finalTree = {
    name: connection.connectionName,
    children: databaseTree,
  }
  return [finalTree]
}

self.addEventListener(
  'message',
  function (e) {
    // self.postMessage(e.data)
    const connection = JSON.parse(e.data)
    Promise.all([
      queryAllColumns(connection),
      queryAllTables(connection),
      queryAllDatabases(connection),
    ]).then((res) => {
      const dataArr = res.map((item) => item.data)
      const treeData = createTree(dataArr[0], dataArr[1], dataArr[2], connection)
      self.postMessage(
        JSON.stringify({
          tree: treeData,
          columns: dataArr[0],
        }),
      )
    })
  },
  false,
)

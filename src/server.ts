import express, { Request, Response } from 'express'
import serveStatic from 'serve-static'
import path from 'path'
import fs from 'fs'
import { parse } from 'node-html-parser'


const app = express()


// remove _cat from the url
app.use((req, res, next) => {
  if (req.url.includes('_cat')) {
    req.url = req.url.replace('_cat', '')
  }
  next()
})

function serveIndex(req: Request, res: Response) {
  const url = process.env.CONNECTION_URL
  const user = process.env.CONNECTION_USER
  const pass = process.env.CONNECTION_PASS
  const html = fs.readFileSync(path.join('click-cat', 'index.html'), 'utf-8')
  const root = parse(html.toString())
  const script = root.querySelector('script')
  script?.insertAdjacentHTML('beforeend', `
  localStorage.setItem('previousConnection', JSON.stringify({"previousConnection":{"connectionName":"sonic","connectionUrl":"${url}","username":"${user}","password":"${pass}","params":""}}));
  localStorage.setItem('connection', JSON.stringify({"connection":{"connectionName":"sonic","connectionUrl":"${url}","username":"${user}","password":"${pass}","params":""}}));
  `)

  const content = root.toString()
  res.send(content)
}

app.get('/',serveIndex)

app.use(serveStatic(path.join( 'click-cat')))


app.get('/*',serveIndex)

app.listen(8080)

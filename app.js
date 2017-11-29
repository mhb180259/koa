const Koa = require('koa')
const app = new Koa()

// 通过ctx.request.url手动获取并处理路由
app.use(async ctx => {
  let _html = '<h1>404 NotFound</h1>'
  switch (ctx.url) {
    case '/hello':
      _html = '<h1>Hello</h1>'
      break
    case '/world':
      _html = '<h1>World</h1>'
      break
    default:
      break
  }
  ctx.body = _html
})

// 通过koa-router处理路由
const Router = require('koa-router')
const router = new Router()
router.get('/', async (ctx) => {
  let html = `
    <ul>
        <li><a href="/hello">hello</a></li>
        <li><a href="/about">about</a></li>
    </ul>
  `
  ctx.body = html
}).get('/hello', async(ctx) => {
  ctx.body = '<h1>Hello World!</h1>'
}).get('/about', async(ctx) => {
  ctx.body = '<h1>about</h1>'
})
app.use(router.routes(), router.allowedMethods())


// Koa 的最大特色，也是最重要的一个设计，就是中间件（middleware）Koa
// 应用程序是一个包含一组中间件函数的对象，它是按照类似堆栈的方式组织和执行的。
// Koa中使用 app.use()用来加载中间件，基本上Koa 所有的功能都是通过中间件实现的。
// 每个中间件默认接受两个参数，第一个参数是 Context 对象，第二个参数是 next函数。
// 只要调用 next函数，就可以把执行权转交给下一个中间件。

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})

// logger
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method}${ctx.url} - ${ms}`)
})
// response
app.use(async ctx => {
  ctx.body = 'Hello World'
})
// https://github.com/koajs/koa/wiki#middleware

// koa使用模板引擎
// npm i koa-views --save
// npm i ejs --save
const views = require('koa-views')
const path = require('path')
app.use(views(path.join(__dirname, './view'), {
  extension: 'ejs'
}))
app.use(async (ctx) => {
  let title = 'Koa2'
  await ctx.render('index', {
    title
  })
})
// ejs语法：https://github.com/mde/ejs

// 静态资源服务器
// npm i --save koa-static
const path = require('path')
const static = require('koa-static')
const staticPath = './static'
app.use(static(
  path.join(__dirname, staticPath)
))
app.use(async (ctx) => {
  ctx.body = 'hello world'
})

// 请求数据的获取
app.use(async (ctx) => {
  const url = ctx.url
  const query = ctx.query
  const querystring = ctx.querystring
  ctx.body = {
    url,
    query,
    querystring
  }
})
//http://koajs.com/#request

const bodyParser = require('koa-bodyparser')
app.use(bodyParser())
app.use(async(ctx) => {
  if (ctx.url === '/' && ctx.method === 'GET') {
    let html = `
      <h1>koa-bodyparser</h1>
      <form action="/" method="post">
        Name: <input type="text" name="name"><br>
        Age: <input type="text" name="age"><br>
        Email: <input type="text" name="email"><br>
        <button type="submit">submit</button>
      </form>
    `
    ctx.body = html
  } else if (ctx.url === '/' && ctx.method === 'POST') {
    ctx.body = ctx.request.body
  } else {
    ctx.body = '<h1>404 Not Found</h1>'
  }
})
app.listen(3000)

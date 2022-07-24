const router = require('koa-router')()
const jsonwebtoken = require('jsonwebtoken')
const util = require('util')
const { SECRET } = require('../config/index')

const verify = util.promisify(jsonwebtoken.verify)  

const USER = {
  username: 'admin',
  password: '123456',
  id: 100001
}

const getUserToken = async (ctx) => {
  const token = ctx.header.authorization
  const payload = await verify(token.split(' ')[1], SECRET)
  return payload
}

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/api/user', async (ctx, next) => {
  const info = await getUserToken(ctx)
  ctx.body = {
    code: 200,
    data: info || USER,
    msg: '请求成功'
  }
})

router.post('/api/login', async (ctx, next) => {
  let checkUser = ctx.request.body.username == USER.username && ctx.request.body.password == USER.password;
  if (checkUser) {
    let userToken = {name: USER.username, id: USER.id};
    ctx.body = {
      code: 200,
      msg: '登录成功',
      token: jsonwebtoken.sign(
        userToken,  // 加密userToken, 等同于上面解密的userToken
        SECRET, 
        {expiresIn: '1h'}  // 有效时长1小时
      )
    }
  } else {
    // 登录失败, 用户名密码不正确
    ctx.body = {
      code: 400,
      msg: '用户名密码不匹配'
    }
  }
})

module.exports = router

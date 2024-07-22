const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
require('dotenv').config()

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')

//前台路由文件
const receptionIndexRouter = require('./routes/reception/index')
const categoriesRouter = require('./routes/reception/categories')
const coursesRouter = require('./routes/reception/courses')
const chaptersRouter = require('./routes/reception/chapters')
const articlesRouter = require('./routes/reception/articles')
const settingsRouter = require('./routes/reception/settings')
const searchRouter = require('./routes/reception/search')
//后台路由文件
const adminArticlesRouter = require('./routes/admin/articles')
const adminCategoriesRouter = require('./routes/admin/categories')
const adminSettingsRouter = require('./routes/admin/settings')
const adminUsersRouter = require('./routes/admin/users')
const adminCoursesRouter = require('./routes/admin/courses')
const adminChaptersRouter = require('./routes/admin/chapters')
const adminChartsRouter = require('./routes/admin/charts')
const adminAuthRouter = require('./routes/admin/auth')
const adminAuth = require('./middlewares/admin-auth')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)

//后台路由配置
app.use('/admin/articles', adminAuth, adminArticlesRouter)
app.use('/admin/categories', adminAuth, adminCategoriesRouter)
app.use('/admin/settings', adminAuth, adminSettingsRouter)
app.use('/admin/users', adminAuth, adminUsersRouter)
app.use('/admin/courses', adminAuth, adminCoursesRouter)
app.use('/admin/chapters', adminAuth, adminChaptersRouter)
app.use('/admin/charts', adminAuth, adminChartsRouter)
app.use('/admin/auth', adminAuthRouter)

//前台路由配置
app.use('/reception', receptionIndexRouter)
app.use('/categories', categoriesRouter)
app.use('/courses', coursesRouter)
app.use('/chapters', chaptersRouter)
app.use('/articles', articlesRouter)
app.use('/settings', settingsRouter)
app.use('/search', searchRouter)

module.exports = app

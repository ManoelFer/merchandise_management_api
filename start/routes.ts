/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

Route.get('test_db_connections', async ({ response }: HttpContextContract) => {
  await Database.report().then(({ health }) => {
    const { healthy, message } = health

    if (healthy) return response.ok({ message })

    return response.status(500).json({ message })
  })
})

// Public Routes Group
Route.group(() => {
  Route.post('login', 'AuthController.login')

  Route.post('users/', 'UsersController.store')

  Route.resource('redis/', 'TestRedisController').only(['show', 'destroy', 'store'])
}).prefix('v1/api')

// Client Routes Group
Route.group(() => {
  Route.resource('users/', 'UsersController').except(['store', 'index', 'destroy'])
  Route.resource('products/', 'ProductsController').except(['store', 'destroy'])
  Route.resource('cart/', 'CartController').apiOnly()
  Route.resource('purchases/', 'PurchasesController').only(['store', 'index', 'show'])
})
  .prefix('v1/api')
  .middleware(['auth', 'is:client'])

// Employee Routes Group
Route.group(() => {
  Route.resource('products/', 'ProductsController').only(['store', 'destroy'])
  Route.resource('categories/', 'CategoriesController').apiOnly()
})
  .prefix('v1/api')
  .middleware(['auth', 'is:employee'])

// Admin Routes group
Route.group(() => {
  Route.resource('users/', 'UsersController').only(['index', 'destroy'])
  Route.post('users/access_allow', 'UsersController.AccessAllow')
})
  .prefix('v1/api')
  .middleware(['auth', 'is:admin'])

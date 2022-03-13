import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

import Product from 'App/Models/Product'

import StoreValidator from 'App/Validators/Product/StoreValidator'
import UpdateValidator from 'App/Validators/Product/UpdateValidator'
import Category from 'App/Models/Category'

export default class ProductsController {
  public async index({ response, request }: HttpContextContract) {
    const { page, perPage, noPaginate, ...inputs } = request.qs()

    if (noPaginate) {
      return Product.query().preload('categories').filter(inputs)
    }

    try {
      const products = await Product.query()
        .preload('categories')
        .filter(inputs)
        .paginate(page || 1, perPage || 10)

      return response.ok(products)
    } catch (error) {
      return response.badRequest({
        message: 'error in list products',
        originalError: error.message,
      })
    }
  }

  public async store({ response, request }: HttpContextContract) {
    await request.validate(StoreValidator)

    const body = request.only(['name', 'code', 'price'])
    const { categories } = request.all()

    let productCreated

    const trx = await Database.beginGlobalTransaction()

    try {
      productCreated = await Product.create(body, trx)

      await Promise.all(
        categories.map(async (categoryName) => {
          const hasCategory = await Category.findBy('name', categoryName)
          if (hasCategory) await productCreated.related('categories').attach([hasCategory.id], trx)
        })
      )
    } catch (error) {
      trx.rollback()
      return response.badRequest({
        message: 'Error in create product',
        originalError: error.message,
      })
    }

    let product
    try {
      product = await Product.query()
        .where('id', productCreated.id)
        .preload('categories')
        .firstOrFail()
    } catch (error) {
      trx.rollback()
      return response.badRequest({
        message: 'Error in find product',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(product)
  }

  public async show({ response, params }: HttpContextContract) {
    const productSecureId = params.id

    try {
      const product = await Product.query()
        .where('secure_id', productSecureId)
        .preload('categories')
        .firstOrFail()

      return response.ok(product)
    } catch (error) {
      return response.notFound({ message: 'Product not found', originalError: error.message })
    }
  }

  public async update({ response, request, params }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const productSecureId = params.id
    const bodyProduct = request.only(['name', 'code', 'price'])
    const { categories } = request.all()

    let productUpdated

    const trx = await Database.beginGlobalTransaction()

    try {
      productUpdated = await Product.findByOrFail('secure_id', productSecureId)

      productUpdated.useTransaction(trx)

      let categoryIds: number[] = []
      await Promise.all(
        categories.map(async (categoryName) => {
          const hasCategory = await Category.findBy('name', categoryName)
          if (hasCategory) categoryIds.push(hasCategory.id)
        })
      )

      await productUpdated.related('categories').sync(categoryIds, trx)

      await productUpdated.merge(bodyProduct).save()
    } catch (error) {
      trx.rollback()
      return response.badRequest({
        message: 'Error in update products',
        originalError: error.message,
      })
    }

    let product
    try {
      product = await Product.query()
        .where('id', productUpdated.id)
        .preload('categories')
        .firstOrFail()
    } catch (error) {
      trx.rollback()
      return response.badRequest({
        message: 'Error in find product',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(product)
  }

  public async destroy({ response, params }: HttpContextContract) {
    const productSecureId = params.id

    try {
      const product = await Product.query().where('secure_id', productSecureId).firstOrFail()

      product.delete()

      return response.ok({ message: 'Product deleted successfully' })
    } catch (error) {
      return response.notFound({ message: 'Product not found', originalError: error.message })
    }
  }
}

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cart from 'App/Models/Cart'

import CartStoreValidator from 'App/Validators/Cart/StoreValidator'
import CartUpdateValidator from 'App/Validators/Cart/UpdateValidator'

export default class CartController {
  public async index({ auth, response }: HttpContextContract) {
    const userAuthenticated = auth.user?.id

    let cartInfo = {
      itensQuantity: 0,
      totalPrice: 0,
    }

    if (userAuthenticated) {
      try {
        const itemsCart = await Cart.query()
          .where('user_id', userAuthenticated)
          .preload('user', (queryUser) => {
            queryUser.select('id', 'name', 'email')
          })
          .preload('product', (queryProduct) => {
            queryProduct.select('id', 'name', 'code', 'price')
          })

        itemsCart.forEach(({ quantity, product }, index) => {
          cartInfo.totalPrice = product.price * quantity + cartInfo.totalPrice
          cartInfo.itensQuantity = index + 1
        })

        return response.ok({
          cartInfo,
          itemsCart,
        })
      } catch (error) {
        return response.notFound({ message: 'Cart items not found', originalError: error.message })
      }
    } else {
      return response.unauthorized({ message: 'You need to be logged' })
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    await request.validate(CartStoreValidator)

    let bodyCart = request.only(['user_id', 'product_id', 'quantity'])

    bodyCart.user_id = auth.user?.id

    const hasProductInCart = await Cart.query()
      .where('user_id', bodyCart.user_id)
      .andWhere('product_id', bodyCart.product_id)
      .first()

    if (hasProductInCart) {
      return response.badRequest({ message: 'This product is already in the cart' })
    }

    try {
      const cart = await Cart.create(bodyCart)

      return response.ok(cart)
    } catch (error) {
      return response.badRequest({
        message: 'Error register item in the cart',
        originalError: error.message,
      })
    }
  }

  public async show({ response, auth, params }: HttpContextContract) {
    const userAuthenticated = auth.user?.id
    const productId = params.id

    if (userAuthenticated) {
      try {
        const itemCart = await Cart.query()
          .where('user_id', userAuthenticated)
          .andWhere('product_id', productId)
          .preload('user', (queryUser) => {
            queryUser.select('id', 'name', 'email')
          })
          .preload('product', (queryProduct) => {
            queryProduct.select('id', 'name', 'code', 'price')
          })
          .firstOrFail()

        return response.ok({
          priceItemTotal: itemCart.quantity * itemCart.product.price,
          itemCart,
        })
      } catch (error) {
        return response.notFound({ message: 'Cart item not found', originalError: error.message })
      }
    } else {
      return response.unauthorized({ message: 'You need to be logged' })
    }
  }

  public async update({ request, auth, params, response }: HttpContextContract) {
    await request.validate(CartUpdateValidator)

    const userAuthenticated = auth.user?.id
    const productId = params.id
    const { addQtdItem, removeQtdItem } = request.all()

    if (userAuthenticated) {
      try {
        const itemCart = await Cart.query()
          .where('user_id', userAuthenticated)
          .andWhere('product_id', productId)
          .firstOrFail()

        if (addQtdItem) {
          itemCart.quantity = itemCart.quantity + 1
        } else if (removeQtdItem) {
          itemCart.quantity = itemCart.quantity - 1
        }

        await itemCart.save()

        return response.ok(itemCart)
      } catch (error) {
        return response.notFound({ message: 'Cart item not found', originalError: error.message })
      }
    } else {
      return response.unauthorized({ message: 'You need to be logged' })
    }
  }

  public async destroy({ response, auth, params }: HttpContextContract) {
    const userAuthenticated = auth.user?.id
    const productId = params.id

    if (userAuthenticated) {
      try {
        const itemCart = await Cart.query()
          .where('user_id', userAuthenticated)
          .andWhere('product_id', productId)
          .firstOrFail()

        await itemCart.delete()

        return response.ok({
          message: 'Item removed successfully',
        })
      } catch (error) {
        return response.notFound({ message: 'Cart item not found', originalError: error.message })
      }
    } else {
      return response.unauthorized({ message: 'You need to be logged' })
    }
  }
}

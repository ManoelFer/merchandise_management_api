import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Address from 'App/Models/Address'
import Role from 'App/Models/Role'
import User from 'App/Models/User'

import StoreValidator from 'App/Validators/User/StoreValidator'
import UpdateValidator from 'App/Validators/User/UpdateValidator'
import AccessAllowValidator from 'App/Validators/User/AccessAllowValidator'
import { sendMail } from 'App/Services/sendMail'

export default class UsersController {
  public async index({ response, request }: HttpContextContract) {
    const { page, perPage, noPaginate, ...inputs } = request.qs()

    if (noPaginate) {
      return User.query()
        .preload('addresses')
        .preload('roles', (roleTable) => {
          roleTable.select('id', 'name')
        })
        .filter(inputs)
    }

    try {
      const users = await User.query()
        .preload('addresses')
        .preload('roles', (roleTable) => {
          roleTable.select('id', 'name')
        })
        .filter(inputs)
        .paginate(page || 1, perPage || 10)

      return response.ok(users)
    } catch (error) {
      return response.badRequest({ message: 'error in list users', originalError: error.message })
    }
  }

  public async store({ response, request }: HttpContextContract) {
    await request.validate(StoreValidator)

    const bodyUser = request.only(['name', 'cpf', 'email', 'password'])
    const bodyAddress = request.only([
      'zipCode',
      'state',
      'city',
      'street',
      'district',
      'number',
      'complement',
    ])

    let userCreated

    const trx = await Database.beginGlobalTransaction()

    try {
      userCreated = await User.create(bodyUser, trx)
      const roleClient = await Role.findBy('name', 'client')
      if (roleClient) await userCreated.related('roles').attach([roleClient.id], trx)
    } catch (error) {
      trx.rollback()
      return response.badRequest({ message: 'Error in create user', originalError: error.message })
    }

    try {
      await userCreated.related('addresses').create(bodyAddress)
    } catch (error) {
      trx.rollback()
      return response.badRequest({
        message: 'Error in create address',
        originalError: error.message,
      })
    }

    let user
    try {
      user = await User.query()
        .where('id', userCreated.id)
        .preload('roles')
        .preload('addresses')
        .firstOrFail()
    } catch (error) {
      trx.rollback()
      return response.badRequest({
        message: 'Error in find user',
        originalError: error.message,
      })
    }

    try {
      await sendMail(user, 'email/welcome')
    } catch (error) {
      trx.rollback()
      return response.badRequest({
        message: 'Error in send email welcome',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(user)
  }

  public async show({ response, params }: HttpContextContract) {
    const userSecureId = params.id

    try {
      const user = await User.query()
        .where('secure_id', userSecureId)
        .preload('addresses')
        .preload('roles')
        .firstOrFail()

      return response.ok(user)
    } catch (error) {
      return response.notFound({ message: 'User not found', originalError: error.message })
    }
  }

  public async update({ response, request, params }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const userSecureId = params.id
    const bodyUser = request.only(['name', 'cpf', 'email', 'password'])
    const bodyAddress = request.only([
      'addressId',
      'zipCode',
      'state',
      'city',
      'street',
      'district',
      'number',
      'complement',
    ])

    let userUpdated

    const trx = await Database.beginGlobalTransaction()

    try {
      userUpdated = await User.findByOrFail('secure_id', userSecureId)

      userUpdated.useTransaction(trx)

      await userUpdated.merge(bodyUser).save()
    } catch (error) {
      trx.rollback()
      return response.badRequest({ message: 'Error in update user', originalError: error.message })
    }

    try {
      const addressesUpdated = await Address.findByOrFail('id', bodyAddress.addressId)

      addressesUpdated.useTransaction(trx)

      delete bodyAddress.addressId

      await addressesUpdated.merge(bodyAddress).save()
    } catch (error) {
      trx.rollback()
      return response.badRequest({
        message: 'Error in update address',
        originalError: error.message,
      })
    }

    let user
    try {
      user = await User.query()
        .where('id', userUpdated.id)
        .preload('roles')
        .preload('addresses')
        .firstOrFail()
    } catch (error) {
      trx.rollback()
      return response.badRequest({
        message: 'Error in find user',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(user)
  }

  public async destroy({ response, params }: HttpContextContract) {
    const userSecureId = params.id

    try {
      const userFind = await User.findByOrFail('secure_id', userSecureId)

      await userFind.delete()

      return response.ok({ message: 'user deleted successfully' })
    } catch (error) {
      return response.notFound({ message: 'User not found', originalError: error.message })
    }
  }

  public async AccessAllow({ response, request }: HttpContextContract) {
    await request.validate(AccessAllowValidator)

    const { user_id, roles } = request.all()

    try {
      const userAllow = await User.findByOrFail('id', user_id)

      let roleIds: number[] = []
      await Promise.all(
        roles.map(async (roleName) => {
          const hasRole = await Role.findBy('name', roleName)
          if (hasRole) roleIds.push(hasRole.id)
        })
      )

      await userAllow.related('roles').sync(roleIds)
    } catch (error) {
      return response.badRequest({ message: 'Error in access allow', originalError: error.message })
    }

    try {
      return User.query().where('id', user_id).preload('roles').preload('addresses').firstOrFail()
    } catch (error) {
      return response.badRequest({
        message: 'Error in find user',
        originalError: error.message,
      })
    }
  }
}

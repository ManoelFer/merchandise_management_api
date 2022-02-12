import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    response.status(200).json({ message: 'Success' })
  }

  public async store({ response, request }: HttpContextContract) {
    const body = request.only(['name', 'idade', 'email'])

    response.ok({ body })
  }

  public async show({ response }: HttpContextContract) {
    response.ok({ message: 'Mostrar um usuário' })
  }

  public async update({ response }: HttpContextContract) {
    response.ok({ message: 'Altera um usuário' })
  }

  public async destroy({ response }: HttpContextContract) {
    response.ok({ message: 'Apagar um usuário' })
  }
}

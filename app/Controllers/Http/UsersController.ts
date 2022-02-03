import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    response.ok({ message: 'Lista todos usuários' })
  }

  public async store({ response }: HttpContextContract) {
    response.ok({ message: 'Cadastrar um usuário' })
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

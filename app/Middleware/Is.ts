import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'

export default class Is {
  public async handle(
    { auth, response }: HttpContextContract,
    next: () => Promise<void>,
    guards?: string[]
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const userId = await auth.user?.id
    let isNext = false

    if (userId && guards) {
      const user = await User.query().where('id', userId).preload('roles').first()
      const userJson = user?.serialize()

      userJson?.roles.forEach(({ name }) => {
        guards.forEach((nameRoleGuards) => {
          if (name.toLowerCase() == nameRoleGuards.toLowerCase()) {
            isNext = true
          }
        })
      })
    }

    if (isNext) return next()

    return response.forbidden({ message: "Your user aren't authorized" })
  }
}

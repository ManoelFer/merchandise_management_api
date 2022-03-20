import Mail from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'

export async function sendMail(user: User, template: string): Promise<void> {
  await Mail.send((message) => {
    message
      .from('merchandise_management@email.com')
      .to(user.email)
      .subject('Welcome to merchandise management!')
      .htmlView(template, { user })
  })
}

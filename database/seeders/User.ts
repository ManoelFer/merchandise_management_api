import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

import User from 'App/Models/User'
import Role from 'App/Models/Role'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    // ---------------- USER ADMIN ---------------------------
    const searchKeyAdmin = { email: 'admin@email.com' }
    const userAdmin = await User.updateOrCreate(searchKeyAdmin, {
      name: 'Admin',
      cpf: '000.000.000-00',
      email: 'admin@email.com',
      password: 'secret',
    })
    const roleAdmin = await Role.findBy('name', 'admin')
    if (roleAdmin) await userAdmin.related('roles').attach([roleAdmin.id])

    // ---------------- USER CLIENT ---------------------------
    const searchKeyClient = { email: 'client@email.com' }
    const userClient = await User.updateOrCreate(searchKeyClient, {
      name: 'Client',
      cpf: '000.000.000-01',
      email: 'client@email.com',
      password: 'secret',
    })
    const roleClient = await Role.findBy('name', 'client')
    if (roleClient) await userClient.related('roles').attach([roleClient.id])

    // ---------------- USER EMPLOYER ---------------------------
    const searchKeyEmployer = { email: 'employer@email.com' }
    const userEmployer = await User.updateOrCreate(searchKeyEmployer, {
      name: 'Employer',
      cpf: '000.000.000-02',
      email: 'employer@email.com',
      password: 'secret',
    })
    const roleEmployer = await Role.findBy('name', 'employee')
    if (roleEmployer) await userEmployer.related('roles').attach([roleEmployer.id])
  }
}

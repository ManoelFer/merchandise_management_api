import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import messagesCustom from '../messagesCustom'

export default class StoreValidator extends messagesCustom {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    product_id: schema.number([
      rules.exists({ table: 'products', column: 'id' }),
      rules.unsigned(),
    ]),
    quantity: schema.number.optional([rules.unsigned()]),
  })
}

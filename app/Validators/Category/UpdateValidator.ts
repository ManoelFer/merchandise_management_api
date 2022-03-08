import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import MessagesCustom from '../messagesCustom'

export default class UpdateValidator extends MessagesCustom {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public refs = schema.refs({
    categoryId: this.ctx.params.id,
  })

  public schema = schema.create({
    name: schema.string.optional({ trim: true }, [
      rules.maxLength(50),
      rules.minLength(3),
      rules.regex(/^[ a-zA-ZÀ-ÿ\u00f1\u00d1]*$/g),

      rules.unique({
        table: 'categories',
        column: 'name',
        caseInsensitive: true,
        whereNot: { id: this.refs.categoryId },
      }),
    ]),

    observation: schema.string.optional({ trim: true }, []),
  })
}

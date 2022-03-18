import { BaseTask } from 'adonis5-scheduler/build'
import Logger from '@ioc:Adonis/Core/Logger'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import 'dayjs/locale/pt-br'

import Cart from 'App/Models/Cart'

export default class VerifyTimeItemInCart extends BaseTask {
  /**
		*	qualquer valor
		,	separador de lista de valores
		-	faixa de valores
		/	valores de passo
 */
  public static get schedule() {
    return '1 34 12 * * *'
  }
  /**
   * Defina ativar o uso do arquivo .lock para a tarefa de repetição de execução de bloco
   * Bloqueie o arquivo salvo em `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    dayjs.extend(isLeapYear)
    dayjs.locale('pt-br')

    try {
      const itensCart = await Cart.all()

      await Promise.all(
        itensCart.map(async (item) => {
          const { created_at } = item.serialize()

          const newDateMoreThan1hour = dayjs(created_at).add(1, 'h').format()
          const currentDate = dayjs().format()

          if (newDateMoreThan1hour < currentDate) {
            try {
              await item.delete()
              return Logger.info('Item removed')
            } catch (error) {
              return Logger.error('Error in deleting item')
            }
          }
        })
      )
    } catch (error) {
      Logger.error('Error in return Cart Itens')
    }
  }
}

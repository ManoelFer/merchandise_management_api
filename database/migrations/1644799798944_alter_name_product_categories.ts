import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterNameProductCategories extends BaseSchema {
  public async up() {
    this.schema.renameTable('product_categories', 'products_categories')
  }

  public async down() {
    this.schema.renameTable('products_categories', 'product_categories')
  }
}

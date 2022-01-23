/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("adjustment_transactions", (table) => {
    table.uuid("id").primary();

    table.string("sku").notNullable();
    table.integer("qty").notNullable();

    table
      .timestamp("created_at", { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("adjustment_transactions");
};

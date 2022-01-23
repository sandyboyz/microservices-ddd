/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("adjustment_transactions", (table) => {
    table.uuid("id").primary();

    table.string("name").notNullable();
    table.string("sku").notNullable().unique();
    table.string("image").notNullable();
    table.float("price").notNullable();

    table.string("description").nullable();

    table
      .timestamp("created_at", { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table
      .timestamp("updated_at", { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table.timestamp("deleted_at", { useTz: true });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("adjustment_transactions");
};

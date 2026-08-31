'use strict';

/**
 * 0001 - Baseline
 *
 * This project's databases (development and production) were originally built
 * with `sequelize.sync()`, so the existing schema already exists and holds live
 * data. This migration is a no-op marker that declares "the pre-migration
 * schema is the starting point" so we can adopt a proper, forward-only
 * migration workflow without rebuilding or dropping any existing tables.
 *
 * The first real, forward migration is 0002 (shared languages).
 *
 * Do NOT delete this migration or re-run it expecting it to create tables.
 * To bootstrap a brand-new empty environment, restore a dump instead (see notes
 * in the migration runbook).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Intentionally empty: existing schema is treated as the baseline.
    // Environment-specific baselining instructions are in the runbook.
  },

  async down(queryInterface, Sequelize) {
    // Nothing to undo: this migration made no schema changes.
  }
};

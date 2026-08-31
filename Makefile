.PHONY: dev build seed check sync db-create db-migrate db-migrate-status db-baseline
NPM = npm run

dev:
	$(NPM) dev
build:
	$(NPM) build

# Database management is done with migrations (not alter-based sync).
check:
	$(NPM) db:migrate:status
db-create:
	$(NPM) db:create
db-migrate:
	$(NPM) db:migrate
db-migrate-status:
	$(NPM) db:migrate:status
db-baseline:
	$(NPM) db:baseline

# Legacy: `sync` now only checks connectivity (never alters schema).
sync:
	node sync-db.js
seed:
	$(NPM) seed

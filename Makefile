.PHONY: dev build sync seed
NPM = npm run

dev:
	$(NPM) dev
build:
	$(NPM) build
sync:
	$(NPM) sync
seed:
	$(NPM) seed

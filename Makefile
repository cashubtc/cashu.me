deploy-production:
	@read -p "Are you sure you want to deploy to production? Enter 'yes': " confirm && [ "$$confirm" = "yes" ] || (echo "Deployment cancelled." && exit 1)
	quasar build -m pwa
	@echo "Deploying to production"
	rsync -az dist/pwa/ caph:/usr/share/caddy/wallet.cashu.me/
	@echo "Deployed to production."
staging:
	quasar build -m pwa
	@echo "Deploying to staging"
	rsync -az dist/pwa/ caph:/usr/share/caddy/staging.cashu.me/
	@echo "Deployed to staging."
pwa:
	quasar dev -m pwa
icons:
	# rm -rf ./public/icons-square
	# rm -rf ./public/icons-round
	# icongenie generate --skip-trim --quality 12 -i icon.png -b background.png && mv ./public/icons/ ./public/icons-square/
	# icongenie generate --skip-trim --quality 12 -i icon-round.png -b background.png && mv public/icons/ public/icons-round/
	# mv ./public/favicon.ico ./public/favicon.ico.bak
	# icongenie generate --skip-trim --quality 12 -i icon.png -b background.png
	# copy over round one "favicon" and "apple-launch" from icons-round to icons
	# use round favicon!
	# mv ./public/favicon.ico.bak ./public/favicon.ico
# android:
# 	quasar build -m pwa
#   npx cap copy android
#   npx cap sync android
#   npx cap open android
electron:
	quasar dev -m electron

sync-cashu-ts:
	@echo "Syncing cashu-ts"
	cd ../cashu-ts
	npm run compile
	cp -r dist/* ../cashu-me/src/cashu-ts
  # cp -r ~/git/cashu-ts ~/git/cashu-me/src/contrib/
  # cp -r ~/git/cashu-ts/dist ~/git/cashu-me/src/contrib/cashu-ts
	quasar build
	@echo "Synced."

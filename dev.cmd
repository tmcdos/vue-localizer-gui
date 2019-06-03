@echo off
set arg1=%1%
if [%arg1%]==[] (
	node --preserve-symlinks --preserve-symlinks-main ../../../../node_modules/@vue/cli-service/bin/vue-cli-service.js serve
)
if NOT [%arg1%]==[] (
	if [%arg1%]==[report] (
		node --preserve-symlinks --preserve-symlinks-main ../../../../node_modules/@vue/cli-service/bin/vue-cli-service.js build --report
	)
	if [%arg1%]==[css] (
		node --preserve-symlinks --preserve-symlinks-main ../../../../node_modules/stylelint/bin/stylelint.js src/**/*.{vue,css,scss} --fix
	)
	if [%arg1%]==[fix] (
		node --preserve-symlinks --preserve-symlinks-main ../../../../node_modules/eslint/bin/eslint.js --ext .js,.vue src --fix
	)
	if [%arg1%]==[b] (
		node --preserve-symlinks --preserve-symlinks-main ../../../../node_modules/@vue/cli-service/bin/vue-cli-service.js build
		pause
	)
)
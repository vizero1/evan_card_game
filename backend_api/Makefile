all: build push

push:
	docker push dennistra/evan_card_game:latest
build: 
	npm run build
	docker build . -t dennistra/evan_card_game:latest

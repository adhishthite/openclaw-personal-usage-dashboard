.PHONY: install format lint check test clean dev build ingest

install:
	bun install

format:
	bun run biome format --write .

lint:
	bun run biome check --fix .

check: format lint

test:
	@echo "No tests configured yet"

clean:
	rm -rf .next node_modules

dev:
	bun run dev

build:
	bun run build

ingest:
	bun run ingest

# Define variables
TEMP_DIR = ./dist/$(shell date +'%Y%m%d%H%M%S')

# Phony targets to avoid file conflicts
.PHONY: all build compile test clean

# Default target
all: clean build compile test

# Clean the distribution directory
clean:
	@echo "Cleaning up..."
	@rm -rf ./dist
	@echo "Done"

# Build the TypeScript project
build: clean
	@echo "Building interpreter.js..."
	@mkdir -p $(TEMP_DIR)
	@echo "  Building TypeScript..."
	@tsc -p . --outDir "$(TEMP_DIR)" || { echo "TypeScript build failed" ; exit 1 ; }
	@echo "  Bundling..."
	@cd $(TEMP_DIR); \
		npx browserify cli.js -o index.js ; \
		mv ./index.js ../interpreter.js || { echo "Bundling failed" ; exit 1 ; }
	@echo "Done"
	@rm -rf $(TEMP_DIR)

# Compile the output using qjsc
compile: build
	@echo "Compiling to qjs executable..."
	@echo "  Attaching std lib..."
	@mkdir -p $(TEMP_DIR)
	@touch $(TEMP_DIR)/interpreter.js
	@echo "import * as stdI from 'std';" > $(TEMP_DIR)/interpreter.js
	@echo "globalThis.std = stdI;" >> $(TEMP_DIR)/interpreter.js
	@cat ./dist/interpreter.js >> $(TEMP_DIR)/interpreter.js
	@echo "  Compiling via qjsc..."
	@qjsc -flto -fno-module-loader -o $(TEMP_DIR)/interpreter $(TEMP_DIR)/interpreter.js || { echo "qjsc compilation failed" ; exit 1 ; }
	@chmod +x $(TEMP_DIR)/interpreter
	@mv $(TEMP_DIR)/interpreter ./dist/interpreter
	@rm -rf $(TEMP_DIR)
	@echo "Done"

# Test the compiled output
test: build
	@echo "Running test..."
	@OUTPUT='$(shell qjs --std ./dist/interpreter.js -r ./test/sample-code.asm | head -n 1 | tr -d '[:space:]')' ; \
	EXPECTED="(0x0f,15,0b00001111)" ; \
	if [ "$$OUTPUT" = "$$EXPECTED" ]; then \
		echo "Test Passed."; \
	else \
		echo "Test Failed: Expected '$$EXPECTED', but got '$$OUTPUT'"; \
		exit 1; \
	fi
	@echo "Done"



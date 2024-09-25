# Define variables
TEMP_DIR = ./temp

# Phony targets to avoid file conflicts
.PHONY: all build compile test clean

# Default target
all: clean build compile test

# Clean the distribution directory
clean:
	@echo "Cleaning up..."
	@rm -rf ./dist

# Build the TypeScript project
build: clean
	@echo "Building interpreter.js..."
	@echo "  Building for Node.js..."
	@node ./build-cli.cjs -t node || { echo "Node.js build failed" ; exit 1 ; }
	@echo "  Building for qjs..."
	@node ./build-cli.cjs -t qjs || { echo "QuickJS build failed" ; exit 1 ; }

# Compile the output using qjsc
compile: build
	@echo "Compiling to qjs executable..."
	@echo "  Attaching std lib..."
	@mkdir -p $(TEMP_DIR)
	@touch $(TEMP_DIR)/interpreter.js
	@echo "import * as stdI from 'std';" > $(TEMP_DIR)/interpreter.js
	@echo "globalThis.std = stdI;" >> $(TEMP_DIR)/interpreter.js
	@echo "globalThis.compiledEnvironment = true;" >> $(TEMP_DIR)/interpreter.js
	@cat ./dist/interpreter-qjs.min.mjs >> $(TEMP_DIR)/interpreter.js
	@echo "  Compiling via qjsc..."
	@qjsc -flto -fno-module-loader -o $(TEMP_DIR)/interpreter $(TEMP_DIR)/interpreter.js || { echo "qjsc compilation failed" ; exit 1 ; }
	@chmod +x $(TEMP_DIR)/interpreter
	@mv $(TEMP_DIR)/interpreter ./dist/interpreter
	@rm -rf $(TEMP_DIR)

# Test the compiled output
test: build
	@echo "Running test..."
	@OUTPUT="$(shell qjs --std ./dist/interpreter-qjs.min.mjs -r ./test/sample-code.asm | head -n 1 | tr -d '[:space:]')" ; \
	echo "Output: $${OUTPUT}" ; \
	echo "Expected: 0x0f" ; \

#! env bash

echo "Compiling interpreter..."
npm run build
echo "Done"
echo "Running test..."
qjs --std ./dist/interpreter.js -r ./test/test.asm
echo "Expected to see \"(0x0f, 15, 0b00001111)\""
echo "Done"
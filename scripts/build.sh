#! env bash

tempDirName="./dist/$(date +'%Y%m%d%H%M%S')"
rm -rf ./dist
mkdir ./dist
mkdir $tempDirName
echo "Building TypeScript..."
tsc -p . --outDir "$tempDirName"
cd $tempDirName
echo "Done"
echo "Bundling..."
npx browserify cli.js -o index.js  
mv ./index.js ../interpreter.js
echo "Done"
cd ../../
rm -rf $tempDirName


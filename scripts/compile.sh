tempDirName="./dist/$(date +'%Y%m%d%H%M%S')"
echo "Building interpreter.js..."
npm run build
echo "Done"
echo "Preparing..."
mkdir ./dist
mkdir $tempDirName
touch $tempDirName/interpreter.js
echo "import * as stdI from 'std';" > $tempDirName/interpreter.js   # expicitly import std
echo "globalThis.std = stdI;" >> $tempDirName/interpreter.js        # mount std to globalThis
cat ./dist/interpreter.js >> $tempDirName/interpreter.js
echo "Done"
echo "Compiling via qjsc..."
qjsc -o $tempDirName/interpreter $tempDirName/interpreter.js 
echo "Done"
chmod +x ./$tempDirName/interpreter
mv ./$tempDirName/interpreter ./dist/interpreter
rm -rf ./$tempDirName


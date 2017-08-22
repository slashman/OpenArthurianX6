# Assembly
rm -rf assembly
mkdir assembly
cp -r src/js/* assembly
cp scenarios/wod6/Info.js assembly/ScenarioInfo.js 

# Package
rm -rf build
mkdir build
mkdir build/assets
mkdir build/scenario
mkdir build/scenario/maps
browserify assembly/OAX6.js -o build/oax6.js
cp src/html/* build
cp assets/* build/assets
cp scenarios/wod6/maps/*.json build/scenario/maps

# Clean up
rm -rf assembly
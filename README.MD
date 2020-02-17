All scripts should be executed from the project root directory

== Run in browser ==
Run `./scripts/build.sh`
Then serve the contents of `build` via http

== Run using Electron ==
Make sure you have installed the modules for `packaging/electron/app` via `npm install`
Run `./scripts/electronRun.sh`

== Pack using Electron ==
Run `./scripts/electronPack.sh`
Make sure you have installed the modules for `packaging/electron/packer` via `npm install`
Use the package generated inside the `packaging/electron/packer` directory.
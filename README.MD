Welcome to OpenArthurianX6

# What is OpenArthurianX6

An engine to create games similar to Ultima 6. It comes packed with ready to use content based on Denzi’s cc-by-sa 3.0 oblique tileset so developers can jump straight into map making, NPC design, and scripting to develop their game. (Note that they can use their own graphics too if they want!)

You can see demonstrations of the engine here: https://openarthurian.com/demo/

## What kind of game will you be able to create?
The engine will allow you to create 2D top-down RPGs using orthogonal grid maps with a hybrid real-time / turn-based mode (real-time for normal gameplay, turn-based for combat).

The core of the engine is inspired by the Ultima VI engine, which means you can model your game world as a continuous single scale map where all action takes place (including combat) and you will be able to engage in conversation with NPCs to obtain information and advance through the game and its plot, using plot items to resolve puzzles and uncover secrets and exploring the vast world to find surprises.

Supported graphics styles include the oblique perspective characteristic of the Ultima IV engine, as well as a 3/4 front facing perspective similar to traditional jRPGs ala RPGMaker, and a full top-down perspective for more symbolic, old school games similar to Ultima V.

The engine will include two medieval fantasy art packs from Denzi: one will allow creating maps with an oblique, Ultima VI like perspective, while another one will allow creating older school looking top-down games.

The engine will support situational music triggered by game events or tied to game locations, as well as sound effects for the game actions. Supported formats are MP3, OGG and WAV.

## Features
- Multiple characters party: You will be able to have NPCs and pets join your party, they will follow you around and you’ll be able to command them in combat if needed.
- NPC Schedules: They wake up every day to go to their jobs and come back home in the night. Schedules are customizable per NPC.
- Day and Night cycles: Reduced visibility during the night, different enemies activity.
- Camping (TODO): Make camp in the wilderness to recover your strength, beware being ambushed!
- Party AI (TODO): When in battle mode, other party members can act on their own optionally, selecting a proper target for attack or running away based on general parameters.
- Dialogs: Create a history which is unveiled by talking with NPCs, finding clues and using the information you obtain from them to travel the world.
- Crafting (TODO): Gather elements from the world and combine them between themselves or other items to create new items. Obtain leather from dead animals and create clothing from it, bake bread (of course!), create weapons using metals in a forge, and more!

## Platforms

The games created by the engine are accessible from desktop (Windows, Mac, Linux), mobile (Android, iOS) and also playable on modern browsers.

## Supported input modes

- Keyboard: Movement will be done using the arrow keys, numpad or WASDpad.
- Mouse and touch interfaces: Movement will be done by touching the map in the cardinal direction the player wants to move (without pathfinding). Drag and drop will be supported for inventory management.

## Scripting and Programming

The engine is made on JavaScript, and in case you are going to use it directly (without the scenario creation tools), it will provide a JavaScript API which you could use from your own game’s code. JavaScript is also used for scripting events and behaviors.


# Current Status

We are still in development. Code is messy. Please contribute with

- Bug reports
- Refactors (Need to move to typescript eventually)
- Fixes

# Running the game

## First time setup
- `npm install`

## Scripts

All scripts should be executed from the project root directory

### Run in browser
- Run `./scripts/build.sh`
- Then serve the contents of `build` via http

### Run using Electron
- Make sure you have installed the modules for `packaging/electron/app` via `npm install`
- Run `./scripts/electronRun.sh`

### Pack using Electron
- Run `./scripts/electronPack.sh`
- Make sure you have installed the modules for `packaging/electron/packer` via `npm install`
- Use the package generated inside the `packaging/electron/packer` directory.

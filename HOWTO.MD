How to Create a Game Using OAX6
===============================

Disclaimer
==========
This guide applies for v0.1, first version publicly available to backers. We are in a very early stage still, the engine is limited both in what it can do and on how easy it can be used.

This build is provided for the following reasons:
- So you can fulfill your curiosity on how the game works.
- So you can start having an idea of the capabilities and format of the engine for your future projects using it.
- So that more people (who cares about the project) has access to the source in case something terrible happens.

Setup
=====
After cloning the repository
- Run npm install
- Run ./build.sh
- Run http-server on the build directory
- Check http://localhost:8080

The default scenario should show up in the browser.

Maps
====
Tiled maps are saved on scenarios/wod6/maps. 

Make sure you are using uncompressed JSON format. 

The maps should have the following layers:
- Solid Tiles: Any tile in this layer is considered as solid when loaded on the engine
- Mobs: Tiles placed here should have at least an 'id' custom property, pointing to a valid MobType. It can additionally have a type, which can be 'mob' or 'npc', if the type is npc, then it should have a NPC id instead of a MobType id
  - Buildings: This and the following 4 layers don't have any logical effect, use them to make cool maps.
  - Vegetation
  - Objects
  - Terrain

Scenario Data
=============
Set your scenario data in scenarios/wod6/Info.js

startingState
- minuteOfDay: Determines the stating time
- map: Points to the list of maps below (name)
- x: Starting player position
- y: Starting player position
- party: List of NPCs in the starting party, id, x and y
- scene: Points to the list of scenes below
 
maps
- name: Identifies the name
- filename: Filename in scenario/wod6/maps/

scenes
Key is the scene key, each scene is a list of string which are shown in succession
    
Appearances
===========
Defined in src/js/data/Appearances.js

- The numbers refer to indexes on the tileset
- The mob appearances include 4 frames for each direction

Items
=====

Defined in src/js/data/Items.js Each item can have the following attributes:
- id: Identifies the item
- name: Description of the item
- appearance: Referencing an item appearance on Appearances.js
- flyAppearance: Used when the item is "flying" (for example when thrown)
- throwable: Whether the item can be thrown
- range: Max distance for throwing the item
- flyType: 'rotate' or 'straight' animation to use when throwing the item
- damage: Points of damage caused
    
MobTypes
========

Defined in src/js/data/MobTypes.js
- id: 'soldier',
- name: 'Solider',
- appearance: 'soldier',
- hp: 40,
- damage: 5,
- defense: 3,
- speed: Determines the order in the queue for combat mode
- corpse: References Items.js, item placed on the floor when the mob dies
- intent: 'seekPlayer', 'waitCommand', 'wander', 'combat'

NPCs - Basic Data
=================

Defined in src/js/data/NPCs.js
  
- id
- name
- type: Points to MobTypes
- alignment: 'b' for friendly, 'a' for enemy, 'c' for neutral. Likely to be
  revised
- weapon: Points to Items
- firstTalk: Number, will talk to player first if he gets closer than this.
- intent: Same options as MobTypes

NPCs - Conversations
====================
The conversation trees are defined in the "dialog" attribute of each NPC.

They are a list of objects, each object is a dialog fragment, tied to a keyword.

Each dialog fragment can have either
- A list of dialog pieces (see below)
- A list of dialog variants (see below)
- A synonym keyword

A dialog variant contains a condition with a flag name and value, and a list of dialog pieces. If the condition is met the conversation will follow these dialog pieces.

A dialog piece can be either
- A string of text
- An object with the following types:
  - "event" is similar to a normal text, except it describes something happening instead of something the NPC is saying.
  - "dialogInterruption" is similar to a normal text, except another NPC is talking
  - "endConversation" finishes the current conversation
  - "joinParty" makes the NPC join the party
  - "setFlag" sets a global flag to a given value
  
There is a special dialog fragment marked as "unknown" which is used when the keyword input by the player doesn't match any dialog fragment or variant.

== Assembling a build

Once you have all data set, you can execute the build.sh script, then the game package will be available in the build directory (open the index.html file using a web server)
# Icon Reloader

Obsolete to allow for dependency migration.

Formally: Provides limited support for shadowed strategic icons in server mods.

## Transition

If you were using Icon Reloader with Hodgepodge, v2.0.0 handles icons internally, and you may simply remove the Icon Reloader dependency.

If not, icon mods are now trivial:

### modinfo.json:

    "scenes": {
      "icon_atlas": [
        "coui://ui/mods/myawesomemod/icon_atlas.js"
      ]
    },

### Your `icon_atlas.js`

    model.strategicIcons.push(
      'icon1',
      'icon2',
      'icon3')

## Technical Notes

- The maximum number of strategic icons is 315.
- When a unit first appears, it looks up it's SI by name, and then is assigned that INDEX (or maybe texture offset) into the icon table (at least insofar as blip/not)
- The name-to-slot mapping in the game engine is larger than the icon list (e.g. the slot-to-name mapping) Previously sent icons will remember thir slot number, which is what allows aliasing. (This one may last between games.)

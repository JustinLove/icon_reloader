# Icon Reloader

Provides limited support for shadowed strategic icons in server mods.

By itself, issues a refresh at the start and end of a game.

The mod also supports requests to reallocate the unused icons to new icon ids. It currently considers nine icons unused, so nine custom icons can be requested, after which further requests will be ignored. However, it is also possible to alias to existing icon.

## Bare interface

If you are using HodgePodge, it takes care of this.

    if (atlasMessage) {
      atlasMessage.message('icon_atlas', 'release_icons', [
        'nuke_launcher', 'anti_nuke_launcher',
        'nuke_launcher_ammo', 'anti_nuke_launcher_ammo'])
      atlasMessage.message('icon_atlas', 'request_icons', [
        'baboom', 'titan_gantry'])
      atlasMessage.message('icon_atlas', 'update_and_freeze_icon_changes')
    }

There will be a delay before freeze is executed. This is to ensure the page has updated, and to leave room for other mods to make changes. The reason is that **we can only do this once**: as soon as the freeze command is executed, no further updates to the icon atlas are recognized by the engine during the course of the current game.

### Aliasing

An extended syntax allows you to alias to an existing icon if an unused icon is unavailable. Replace a string in `request_icons` by an object with exatly one key (the unit's icon id) and an array of fallback icons.

    atlasMessage.message('icon_atlas', 'request_icons', [
      {'baboom': ['nuke_launcher_ammo', 'tank_nuke', 'bot_bomb']}
    ])

## Unused Icons

If you intend to use one of the icons, issue a `request_icons`.

-`commander` // two entries, second is used by game
-`energy_storage_adv`
-`metal_storage_adv`
-`tank_lava`
-`paratrooper`
-`tutorial_titan_commander`
-`metal_spot_preview`
-`avatar`
-`deep_space_radar`

## Limits

There must be the stock number of strategic icons, which limits you to 121 (as of 89755) (or rather, the number present when the engine connects) The Icon Extensions client mod raises this to 315.

Unfortunately, custom shaders in server mods are not loaded.

Setting custom icons breaks the 'live' connection to the icon atlas. It limits us to one update, and will break mods which depend on this feature (Strategic Filters)

Units created before icon replacement (and freeze) will be stuck with blips.
## Technical Details

In-between games, you can do almost anything. However this isn't very useful to server mods, which can only operate during a game.

During a game:

- Sending a different length icon list messes up alignment
- Calling `sendIconList` (`handle_icon_list`) will freeze the game's view of the icon atlas at that point. (Prior to that point, changes in the html will be reflected in the icons.)
- Naively reloading the atlas will blank all icons because the page hasn't rendered when the snapshot gets taken (see above)  This can be worked-around by deferring the iconlist, but I don't think page reloading actually buys much given the above limitations.
- When a unit first appears, it looks up it's SI by name, and then is assigned that INDEX (or maybe texture offset) into the icon table (at least insofar as blip/not)
- The name-to-slot mapping in the game engine is larger than the icon list (e.g. the slot-to-name mapping) Previously sent icons will remember thir slot number, which is what allows aliasing. (This one may last between games.)

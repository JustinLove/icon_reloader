# Icon Reloader

Provides limited support for shadowed strategic icons in server mods.

By itself, issues a refresh at the start and end of a game.

The mod also supports requests to reallocate the unused icons to new icon ids. It currently considers nine icons unused, so nine custom icons can be requsted, after which further requests will be ignored.

## Bare interface

This will likely be driven by HodgePodge soon.

    if (atlasMessage) {
      atlasMessage.message('icon_atlas', 'release_icons', ['nuke_launcher', 'anti_nuke_launcher', 'nuke_launcher_ammo', 'anti_nuke_launcher_ammo'])
      atlasMessage.message('icon_atlas', 'request_icons', ['baboom', 'titan_gantry'])
      setTimeout(function() {
        atlasMessage.message('icon_atlas', 'update_and_freeze_icon_changes')
      }, 1000)
    }

The timeout leaves room for other mods to request icons. The reason is that we can only do this once: as soon as the feeze command is executed, no further updates to the icon atlas are recognized by the engine during the course of the current game.

## Unused Icons

Allocated in the order listed. If you intend to use one of the icons, issuing a `request_icons` will remove it from the unused pool without changing the atlas.

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

There must be the stock number of strategic icons, which limits you to 121 (as of 89755) (or rather, the number present when the engine connects)

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

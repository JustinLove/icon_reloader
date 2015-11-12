# Icon Reloader

Provides limited support for shadowed strategic icons in server mods.

## Limits

There must be the stock number of strategic icons, which limits you to 121 (as of 89755)

Presently the icon names must be vanilla.  You can use the unit `si_name` property to set the icon without renaming the unit, see `base_commander` for an example.

Unfortunately, custom shaders in server mods are not loaded.

## Future Work

The mod may in the future manage the handful of unused icons on behalf of piecemeal unit mods. However, this is dicey and conflicts with certain mods (e.g. Strategic Filters); see below.

## Technical Details

In-between games, you can do almost anything. However this isn't very useful to server mods, which can only operate during a game.

During a game:

- Sending a different length icon list messes up alignment
- Calling `sendIconList` (`handle_icon_list`) will freeze the game's view of the icon atlas at that point. (Prior to that point, changes in the html will be reflected in the icons.)
- Naively reloading the atlas will blank all icons because the page hasn't rendered when the snapshot gets taken (see above)  This can be worked-around by deferring the iconlist, but I don't think page reloading actually buys much given the above limitations.
- When a unit first appears, it looks up it's SI by name, and then is assigned that INDEX (or maybe texture offset) into the icon table (at least insofar as blip/not)

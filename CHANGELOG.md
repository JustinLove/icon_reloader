# Icon Reloader

## 1.4.2

- Increase activation timeout to favor blip errors over no-icon errors.

## 1.4.1

- Extend time between changing icons and freezing atlas, we should have at least five seconds before landing.

## 1.4.0

- Icon aliasing allows fallback to vanilla icon if a slot is unavailable.

## 1.3.0

- Hook for Icon Extensions mod
- Leave `deep_space_radar` as used in classic mode
- Confirm the duplicate `commander` before using it
- Change priority to ensure it's loaded for other mods
- Reflect on image status to ensure load before freeze

## 1.2.0

- A delay before freeze is now enforced in the mod, to ensure that it happens relative to message *receipt*, and that the page has time to refresh before the game stops using updates
- Fix typo in atlas message, and rewrite portions to preserve ordered messages during async page lookups

## 1.1.0

- Supports allocating unused icons to new ids

# NC-HUD

A fully customizable, theme-based HUD resource for FiveM.  
Built with **React** (UI) and **Lua** (client-side logic), designed for seamless integration with multiple frameworks.

> Rework by **NOX** — [discord.gg/noxcore](https://discord.gg/noxcore)

---

## Preview

| Light Theme | Dark Theme |
|:-----------:|:----------:|
| ![Light](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/light.png) | ![Dark](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/dark.png) |

| Combined Mode | Separate Stats/Info (Dark) |
|:-------------:|:--------------------------:|
| ![Combined](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/combined.png) | ![Separate Dark](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/separate-stats-info-dark.png) |

| Separate Combined | Separate Stats/Info (Light) |
|:------------------:|:---------------------------:|
| ![Separate Combined](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/separate-combined.png) | ![Separate Light](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/separate-stats-info-light.png) |

| Edit Mode (Combined) | Edit Mode (All Separate) |
|:---------------------:|:------------------------:|
| ![Edit Combined](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/editmode-combined.png) | ![Edit Separate](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/editmode-all-separate.png) |

| Right Side (Circle) | Right Side (Square) |
|:--------------------:|:-------------------:|
| ![Right Circle](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/right-circle.png) | ![Right Square](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/right-square.png) |

| Settings - Options | Settings - Theme |
|:------------------:|:----------------:|
| ![Options](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/options.png) | ![Theme](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/theme.png) |

---

## Features

### HUD Components
- **Player Stats** — Health, Armor, Hunger, Thirst, Oxygen, Stress (icon-based SVG fill indicators)
- **Player Info** — Server ID, In-game Time, Job, Cash & Bank balance
- **Speedometer** — Speed (km/h / mph), RPM bar, Fuel gauge, Waypoint distance, Vehicle status bars (engine, body, fuel level)
- **Vehicle Status Icons** — Seatbelt, Headlights, Turn Signals (L/R), Hazard Lights, Engine, Door Lock, Handbrake
- **Minimap** — Circular minimap overlay with compass directions, tick marks, location bar (street name + postal code)
- **Compass** — Directional heading with nearest postal code display
- **Weapon HUD** — Current weapon name, ammo count (magazine / reserve), with auto-hide on holster
- **Crosshair** — Custom crosshair overlay when aiming
- **Heart Rate System** — Dynamic heart rate based on sprinting, driving speed, damage, and sudden deceleration

### Customization & Settings
- **In-game Settings Panel** — Toggle individual HUD elements, adjust layout modes, select themes (keybind: `I`)
- **Drag & Edit Mode** — Freely reposition all HUD components via drag-and-drop in edit mode
- **Layout Modes** — `COMBINED` (Stats + Info grouped) or `SEPARATE` (each stat/info item individually positioned)
- **Per-Server Positions** — Positions and settings saved per-server using KVP storage
- **Configurable Keybinds** — Seatbelt, Turn Signals, Hazard Lights, HUD Settings (remappable in GTA settings)

### Electric Vehicle Support
- Automatic detection of electric vehicles based on `fPetrolTankVolume` threshold
- Speed-based RPM simulation for single-gear electric vehicles
- Configurable detection threshold

### Stungun Ammo System
- Custom ammo counter with recharge mechanic
- Configurable max ammo and recharge time
- Notification on full recharge

### Theme System
- **External Theme Support** — Register custom themes from separate resources via `exports['nc-hud']:RegisterTheme()`
- **Component Override** — Themes can replace specific HUD components (Stats, Info, Speedometer, Minimap, Compass, Weapon)
- **Custom CSS Injection** — Themes can provide custom CSS via URL
- **Theme Settings** — Each theme can expose its own settings panel via callback
- **Dynamic Load/Unload** — Themes register on resource start and unregister on stop

### Multi-Framework Support
- **QBCore** (`qb-core`)
- **QBox** (`qbx_core`)
- **ESX** (`es_extended`)
- **Ox Core** (`ox_core`)
- **Standalone** (no framework)

### Integrations
- **Fuel Systems** — LegacyFuel, ox_fuel, ps-fuel, cdn-fuel, lj-fuel, okokGasStation, ti_fuel, myFuel, x-fuel, BigDaddy-Fuel, hyon_gas_station, or custom
- **Voice Systems** — pma-voice, mumble-voip, saltychat, tokovoip, or custom
- **Death Detection** — wasabi_ambulance, qb-ambulancejob, esx_ambulancejob, or custom
- **Notifications** — ox_lib, QBCore, ESX, or custom

---

## Dependencies

- [ox_lib](https://github.com/overextended/ox_lib)

---

## Installation

1. Download or clone this resource into your server's `resources` folder.
2. Add `ensure nc-hud` to your `server.cfg`.
3. Configure `shared.lua` to match your server environment (framework is auto-detected).
4. Restart the server.

---

## Configuration

All settings are managed in `shared.lua`:

| Setting | Description | Default |
|---|---|---|
| `Config.FuelResource` | Fuel system resource name | `'default'` |
| `Config.VoiceResource` | Voice chat resource name | `'pma-voice'` |
| `Config.DeathResource` | Death detection resource | `'wasabi_ambulance'` |
| `Config.Stungun.enabled` | Enable stungun ammo system | `true` |
| `Config.Stungun.maxAmmo` | Stungun max ammo | `2` |
| `Config.Stungun.rechargeTime` | Stungun recharge time (ms) | `15000` |
| `Config.Keybinds.seatbelt` | Seatbelt toggle key | `'b'` |
| `Config.Keybinds.hudSettings` | HUD settings key | `'i'` |
| `Config.HideHudComponents` | GTA HUD components to hide | `{ 6, 7, 8, 9 }` |
| `Config.ElectricVehicleThreshold` | Electric vehicle detection threshold | `1.0` |
| `Config.NotifyResource` | Notification system | `'ox_lib'` |
| `Config.Minimap.circleMapScale` | Circle minimap mask scale | `0.83` |

See `shared.lua` for the full list of settings including heart rate parameters and custom function hooks.

---

## Theme Development

Register an external theme from your own resource:

```lua
exports['nc-hud']:RegisterTheme({
    id = 'my-theme',
    name = 'My Custom Theme',
    resource = GetCurrentResourceName(),
    hiddenComponents = { 'speedometer', 'stats' },
    cssUrl = 'https://your-resource/ui/dist/theme.css',
    openThemeSettings = function()
        -- Open your theme's settings panel
    end,
})
```

Available `hiddenComponents`: `stats`, `info`, `speedometer`, `minimap`, `compass`, `weapon`

---

## Resource Structure

```
nc-hud/
├── shared.lua              # Configuration
├── fxmanifest.lua           # Resource manifest
├── framework/               # Framework adapters
│   ├── qb.lua               # QBCore
│   ├── qbx.lua              # QBox
│   ├── esx.lua              # ESX
│   ├── ox.lua               # Ox Core
│   └── standalone.lua       # Standalone
├── modules/                 # Client modules
│   ├── hud.lua              # Core HUD display toggle
│   ├── speedometer.lua      # Vehicle data & indicators
│   ├── playerstatus.lua     # Health, armor, hunger, thirst, etc.
│   ├── playerinfo.lua       # Server ID, time, job, money
│   ├── minimap.lua          # Circular minimap overlay
│   ├── compass.lua          # Heading & postal codes
│   ├── weapon.lua           # Weapon name, ammo, stungun
│   ├── settings.lua         # Settings panel & KVP persistence
│   └── themes.lua           # Theme registration & broadcasting
├── util/
│   └── client.lua           # Utility functions (Notify, NuiMessage)
├── data/
│   └── postals.json         # Postal code coordinates
└── ui/                      # React UI (Vite)
    └── src/
        ├── components/       # HUD components (JSX)
        └── providers/        # Context providers (Theme, Position)
```

---

## License

This resource is licensed under the **GNU General Public License v3.0**.  
See [LICENSE](LICENSE) for details.

# Copyright

Copyright © 2024 AfterLifeStudio https://github.com/AfterLifeStudio


# NC-HUD

A fully customizable HUD for FiveM with React UI, cinematic mode, theme system, and multi-framework support.

> Rework by **NOX** — [discord.gg/noxcore](https://discord.gg/noxcore)

---

## Preview

| Dark Mode (Square) | Dark Mode (Circle) |
|:-------------------:|:-------------------:|
| ![Dark Square](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/hud-dark.png) | ![Dark Circle](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/hud-dark-c.png) |

| Light Mode (Square) | Light Mode (Circle) |
|:--------------------:|:--------------------:|
| ![Light Square](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/hud-light.png) | ![Light Circle](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/hud-light-c.png) |

| Edit Mode (Combined) | Edit Mode (Separate) |
|:---------------------:|:--------------------:|
| ![Edit Combined](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/hud-edit-c.png) | ![Edit Separate](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/hud-edit-s.png) |

| Cinematic Mode |
|:--------------:|
| ![Cinematic](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/hud-cinematic.png) |

| Settings - Options | Settings - Theme |
|:------------------:|:----------------:|
| ![Options](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/options.png) | ![Theme](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/theme.png) |

---

## Features

### HUD Components
- **Player Stats** — Health, Armor, Hunger, Thirst, Oxygen, Stress (icon-based SVG fill indicators)
- **Player Info** — Server ID, In-game Time, Job/Grade, Gang/Grade, Cash & Bank balance
- **Speedometer** — Speed (km/h or mph), RPM gauge, Fuel level, Waypoint distance, Engine & Body health bars
- **Vehicle Status** — Seatbelt, Headlights (off/on/high beam), Turn Signals (L/R), Hazard Lights, Engine, Door Lock, Handbrake
- **Minimap** — Circle or Square minimap with compass directions, street name, and postal code
- **Weapon HUD** — Weapon name, ammo count (clip/reserve), auto-hide on holster, custom crosshair when aiming
- **Heart Rate** — Dynamic heart rate simulation (sprint, collision, damage, sudden deceleration)

### Display Modes
- **Dark / Light Theme** — Toggle between dark and light color schemes
- **Circle / Square Minimap** — Switch minimap shape with automatic mask overlay
- **Cinematic Mode** — Letterbox black bars + all HUD elements hidden + minimap off
- **Minimap Toggle** — Show/hide minimap (hides both NUI overlay and GTA native radar)

### Customization
- **In-game Settings Panel** — Toggle HUD elements, themes, layout modes (keybind: `I`)
- **Drag & Edit Mode** — Reposition all HUD components via drag-and-drop
- **Layout Modes** — `COMBINED` (Stats/Info grouped) or `SEPARATE` (each item individually draggable)
- **Per-Server Settings** — Positions and preferences saved per-server via KVP
- **Configurable Keybinds** — Seatbelt, Turn Signals, Hazard Lights, HUD Settings (remappable in GTA settings)

### Vehicle Features
- **Electric Vehicle Detection** — Auto-detect via `fPetrolTankVolume` with speed-based RPM simulation
- **Seatbelt System** — Fly-through windscreen protection toggle
- **Flight Data** — Heading, pitch, roll, landing gear, stall detection for helicopters and planes

### Stungun Ammo System
- Custom ammo counter with automatic recharge
- Configurable max ammo and recharge cooldown
- Notification on full recharge

### Theme System
- **External Themes** — Register custom themes from separate resources via `exports['nc-hud']:RegisterTheme()`
- **Component Override** — Themes can selectively replace: Stats, Info, Speedometer, Minimap, Compass, Weapon, Crosshair
- **Data Broadcasting** — Replaced components receive data via client events (`nc-hud:theme:*`)
- **Dynamic Load/Unload** — Themes auto-register on resource start, unregister on stop

### Multi-Framework Support
| Framework | Resource | Detection |
|-----------|----------|:---------:|
| QBCore | `qb-core` | Auto |
| QBox | `qbx_core` | Auto |
| ESX | `es_extended` | Auto |
| Ox Core | `ox_core` | Auto |
| Standalone | — | Fallback |

### Integrations
- **Fuel** — LegacyFuel, ox_fuel, ps-fuel, cdn-fuel, lj-fuel, okokGasStation, ti_fuel, myFuel, x-fuel, BigDaddy-Fuel, hyon_gas_station, or custom function
- **Voice** — pma-voice, mumble-voip, saltychat, tokovoip, or custom event
- **Death Detection** — wasabi_ambulance, qb-ambulancejob, esx_ambulancejob, or custom function
- **Notifications** — ox_lib, QBCore, ESX, or custom function

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

---

## 🎨 Addon Theme — nc-theme-v1 ($20, Open Source)

A premium custom theme addon for NC-HUD with unique speedometers for every vehicle class, per-category edit mode, and a dedicated settings panel.

> **[🛒 Purchase on Tebex](https://noxcore.tebex.io/package/7286235)**

### Vehicle-Class Speedometers

| Vehicle | Cycle | Bike |
|:-------:|:-----:|:----:|
| ![Vehicle](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/vehicle.png) | ![Cycle](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/cycle.png) | ![Bike](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/bike.png) |

| Helicopter / Plane | Boat |
|:-------------------:|:----:|
| ![Air](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/heli(air).png) | ![Boat](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/boat.png) |

### Per-Category Edit Mode

| Edit Mode | HUD | Car |
|:---------:|:---:|:---:|
| ![Edit Mode](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/editmode.png) | ![Edit HUD](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/editmode-hud.png) | ![Edit Car](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/editmode-car.png) |

| Boat | Air | Bike |
|:----:|:---:|:----:|
| ![Edit Boat](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/editmode-boat.png) | ![Edit Air](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/editmode-air.png) | ![Edit Bike](https://r2.fivemanage.com/AGIqkS85vq6NpkHypOknK/editmode-bike.png) |

---

# Copyright

Copyright © 2024 AfterLifeStudio https://github.com/AfterLifeStudio


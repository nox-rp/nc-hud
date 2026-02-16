--[[
    NC-HUD Configuration
    Rework by NOX (discord.gg/noxcore)
    
    Modify the settings below to match your server environment.
    All custom settings are managed through this file.
]]

Config = {}

-- Framework Auto-Detection (no modification needed)

---@return string
local GetFramework = function()
    if GetResourceState('es_extended') ~= 'missing' then
        return 'esx'
    elseif GetResourceState('qbx_core') ~= 'missing' then
        return 'qbx'
    elseif GetResourceState('qb-core') ~= 'missing' then
        return 'qb'
    elseif GetResourceState('ox_core') ~= 'missing' then
        return 'ox'
    else
        return 'standalone'
    end
end

---@type string
Framework = GetFramework()

-- Fuel System
-- Set this to match the fuel resource you are using.
-- Supported: 'default', 'LegacyFuel', 'ox_fuel', 'ps-fuel', 'cdn-fuel', 'lj-fuel',
--            'okokGasStation', 'ti_fuel', 'myFuel', 'x-fuel', 'BigDaddy-Fuel',
--            'hyon_gas_station', 'custom'
Config.FuelResource = 'default'

-- Custom fuel function (only used when Config.FuelResource = 'custom')
-- vehicle: current vehicle entity | return: 0~100 (fuel percent)
Config.GetCustomFuel = function(vehicle)
    return GetVehicleFuelLevel(vehicle)
end

-- Voice System
-- Supported: 'pma-voice', 'mumble-voip', 'saltychat', 'tokovoip', 'custom'
Config.VoiceResource = 'pma-voice'

-- Custom voice event (only used when Config.VoiceResource = 'custom')
Config.VoiceEvents = {
    talkingMode = 'pma-voice:setTalkingMode',
}

-- Death Detection System
-- Used to hide weapon HUD on death.
-- Supported: 'none', 'wasabi_ambulance', 'qb-ambulancejob', 'esx_ambulancejob', 'custom'
Config.DeathResource = 'wasabi_ambulance'

-- Custom death check function (only used when Config.DeathResource = 'custom')
-- return: true = dead, false = alive
Config.IsPlayerDead = function()
    return IsEntityDead(PlayerPedId())
end

-- Stungun Settings
Config.Stungun = {
    enabled = true,         -- Enable custom stungun ammo system
    maxAmmo = 2,            -- Max ammo count
    rechargeTime = 15000,   -- Recharge time (ms) - 15 seconds
}

-- Keybinds
-- Ref: https://docs.fivem.net/docs/game-references/input-mapper-parameter-ids/keyboard/
-- Players can change these in-game via Settings > Key Bindings.
Config.Keybinds = {
    seatbelt = 'b',          -- Toggle seatbelt
    indicatorLeft = 'LEFT',  -- Left turn signal
    indicatorRight = 'RIGHT',-- Right turn signal
    warningLights = 'DOWN',  -- Hazard lights
    hudSettings = 'i',       -- Open HUD settings
}

-- Hidden GTA HUD Components
-- Ref: https://docs.fivem.net/natives/?_0x6806C51AD12B83B8
-- 1=WANTED_STARS, 2=WEAPON_ICON, 3=CASH, 4=MP_CASH, 5=MP_MESSAGE,
-- 6=VEHICLE_NAME, 7=CASH, 8=CASH_CHANGE, 9=RETICLE, 10=SUBTITLE_TEXT,
-- 11=AREA_NAME, 12=VEHICLE_CLASS, 13=STREET_NAME
Config.HideHudComponents = { 6, 7, 8, 9 }

-- Electric Vehicle Detection
-- Vehicles with fPetrolTankVolume <= this value are treated as electric
Config.ElectricVehicleThreshold = 1.0

-- Heart Rate System
Config.HeartRate = {
    baseRate = 72,          -- Resting heart rate
    minRate = 60,           -- Minimum heart rate
    maxRate = 195,          -- Maximum heart rate
    spikeMin = 120,         -- Minimum heart rate during spike
    riseSpeed = 0.15,       -- Rise speed (0~1, higher = faster)
    fallSpeed = 0.02,       -- Fall speed (0~1, higher = faster)
    damageMultiplier = 0.8, -- Damage to heart rate conversion factor
    decelThreshold = 30,    -- Sudden deceleration threshold (speed difference)
}

-- Notification System
-- Supported: 'ox_lib', 'qb', 'esx', 'custom'
Config.NotifyResource = 'ox_lib'

-- Custom notification function (only used when Config.NotifyResource = 'custom')
Config.CustomNotify = function(title, description, type)
    -- Example: exports['mythic_notify']:DoCustomHudText(type, description)
end

-- Minimap Settings
Config.Minimap = {
    circleMapScale = 0.83,  -- Circle minimap mask scale (0.1~2.0)
}







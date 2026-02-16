local GetResourceKvpString = GetResourceKvpString
local SetResourceKvp = SetResourceKvp
local PlaySoundFromEntity = PlaySoundFromEntity
local GetCurrentServerEndpoint = GetCurrentServerEndpoint

---@class GlobalSettings 
GlobalSettings = {
    showhud = true,
    cinemtic = false,
    circlemap = false,
    showspeedometer = true,
    showplayerstatus = true,
    showplayerinfo = true,
    showminimap = true,
    speedunitmph = true,
    squaremap = false,
    minimapLeft = true,
    statInfoCombined = true,
    statsCombined = true,
    infoCombined = true,
    darkmode = true,
}
HudLoaded = false

-- Server-specific KVP key
local function GetServerKvpKey()
    local endpoint = GetCurrentServerEndpoint() or 'local'
    local safeKey = endpoint:gsub('[:%.]', '_')
    return 'Hud:' .. safeKey
end

---@class Settings
local Settings = {
    showhud = true,
    cinemtic = false,
    circlemap = false,
    showspeedometer = true,
    showplayerstatus = true,
    showplayerinfo = true,
    showminimap = true,
    speedunitmph = true,
    squaremap = false,
    minimapLeft = true,
    statInfoCombined = true,
    statsCombined = true,
    infoCombined = true,
    darkmode = true,
}

-- Position storage settings (per-server KVP)
local PositionSettings = {
    playerStatsX = 0,
    playerStatsY = 0,
    playerInfoX = 0,
    playerInfoY = 0,
    speedometerX = 0,
    speedometerY = 0,
    combinedX = 0,
    combinedY = 0,
    -- SEPARATE mode individual item positions
    stats_healthX = 0, stats_healthY = 0,
    stats_armorX = 0, stats_armorY = 0,
    stats_hungerX = 0, stats_hungerY = 0,
    stats_thirstX = 0, stats_thirstY = 0,
    stats_oxygenX = 0, stats_oxygenY = 0,
    stats_stressX = 0, stats_stressY = 0,
    info_serverX = 0, info_serverY = 0,
    info_timeX = 0, info_timeY = 0,
    info_jobX = 0, info_jobY = 0,
    info_cashX = 0, info_cashY = 0,
    info_bankX = 0, info_bankY = 0,
}

-- UI ready state
local UiReady = false

-- Load settings from KVP (without sending to UI)
local function LoadSettingsFromKvp()
    local kvpKey = GetServerKvpKey()
    
    local data = GetResourceKvpString(kvpKey)
    if data then
        local loadedSettings = json.decode(data)
        if loadedSettings then
            for k, v in pairs(Settings) do
                if loadedSettings[k] ~= nil then
                    GlobalSettings[k] = loadedSettings[k]
                else
                    GlobalSettings[k] = v
                end
            end
        end
    else
        for k, v in pairs(Settings) do
            GlobalSettings[k] = v
        end
        SetResourceKvp(kvpKey, json.encode(GlobalSettings))
    end
    
    -- Load position settings
    local posKey = kvpKey .. ':Pos'
    local posData = GetResourceKvpString(posKey)
    if posData then
        local positions = json.decode(posData)
        if positions then
            for k, v in pairs(positions) do
                PositionSettings[k] = v
            end
        end
    end
    
    HudLoaded = true
end

-- Send settings to UI
local function SendSettingsToUi()
    if UiReady then
        NuiMessage('loadSettings', GlobalSettings)
        NuiMessage('loadPositions', PositionSettings)
    end
end

---@return boolean
LoadHud = function ()
    -- Load settings from KVP
    LoadSettingsFromKvp()
    
    -- Send settings to UI
    SendSettingsToUi()

    local response = StreamMinimap()
    return response
end


---@param data table
RegisterNUICallback('settings', function (data, cb)
    local value = data.input
    local kvpKey = GetServerKvpKey()

    GlobalSettings[data.option] = value
    SetResourceKvp(kvpKey, json.encode(GlobalSettings))

    if data.option == 'showhud' then
        DisplayHud(GlobalSettings[data.option])
    elseif data.option == 'circlemap' then
        StreamMinimap()
    elseif data.option == 'minimapLeft' then
        StreamMinimap()
    elseif data.option == 'cinemtic' then
        --Todo
    end

    PlaySoundFromEntity(-1, "BACK", cache.ped, "HUD_FRONTEND_DEFAULT_SOUNDSET", 0, 0)

    cb{{}}
end)

-- Position save callback
RegisterNUICallback('savePosition', function (data, cb)
    local kvpKey = GetServerKvpKey() .. ':Pos'
    
    -- Process entire positions object
    if data then
        for key, value in pairs(data) do
            if type(value) == 'table' and value.x ~= nil and value.y ~= nil then
                PositionSettings[key .. 'X'] = value.x
                PositionSettings[key .. 'Y'] = value.y
            end
        end
        SetResourceKvp(kvpKey, json.encode(PositionSettings))
    end
    
    cb{{}}
end)

-- Position load callback
RegisterNUICallback('loadPositions', function (data, cb)
    cb(PositionSettings)
end)

-- Reset to defaults callback
RegisterNUICallback('resetPositions', function (data, cb)
    local kvpKey = GetServerKvpKey() .. ':Pos'
    
    PositionSettings = {
        -- Default container positions
        playerStatsX = 0,
        playerStatsY = 0,
        playerInfoX = 0,
        playerInfoY = 0,
        speedometerX = 0,
        speedometerY = 0,
        combinedX = 0,
        combinedY = 0,
        -- SEPARATE mode individual item positions
        info_serverX = 0, info_serverY = 0,
        info_timeX = 0, info_timeY = 0,
        info_jobX = 0, info_jobY = 0,
        info_cashX = 0, info_cashY = 0,
        info_bankX = 0, info_bankY = 0,
        stats_healthX = 0, stats_healthY = 0,
        stats_armorX = 0, stats_armorY = 0,
        stats_hungerX = 0, stats_hungerY = 0,
        stats_thirstX = 0, stats_thirstY = 0,
        stats_oxygenX = 0, stats_oxygenY = 0,
        stats_stressX = 0, stats_stressY = 0,
    }
    
    SetResourceKvp(kvpKey, json.encode(PositionSettings))
    NuiMessage('positionsReset', PositionSettings)
    cb{{}}
end)

-- Edit Mode callbacks
RegisterNUICallback('enterEditMode', function (data, cb)
    SetNuiFocus(true, true)
    NuiMessage('setEditMode', true)
    cb{{}}
end)

-- Edit Mode exit callback
RegisterNUICallback('closeEditMode', function (data, cb)
    SetNuiFocus(false, false)
    cb{{}}
end)

RegisterNUICallback('exitsettings', function (data, cb)
    SetNuiFocus(false, false)
    PlaySoundFromEntity(-1, "BACK", cache.ped, "HUD_FRONTEND_DEFAULT_SOUNDSET", 0, 0)
    cb{{}}
end)

-- Respond when UI requests settings
RegisterNUICallback('requestSettings', function (data, cb)
    if not HudLoaded then
        LoadSettingsFromKvp()
    end
    NuiMessage('loadSettings', GlobalSettings)
    NuiMessage('loadPositions', PositionSettings)
    cb{{}}
end)

-- Send settings when UI is ready
RegisterNUICallback('uiReady', function (data, cb)
    UiReady = true
    if not HudLoaded then
        LoadSettingsFromKvp()
    end
    NuiMessage('loadSettings', GlobalSettings)
    NuiMessage('loadPositions', PositionSettings)
    cb{{}}
end)

lib.addKeybind({
    name = 'hud:settings',
    description = 'Toggle Hud Settings',
    defaultKey = Config.Keybinds.hudSettings or 'i',
    onPressed = function(self)
        PlaySoundFromEntity(-1, "BACK", cache.ped, "HUD_FRONTEND_DEFAULT_SOUNDSET", 0, 0)
        NuiMessage('settings',GlobalSettings)
        SetNuiFocus(true, true)
    end,
})

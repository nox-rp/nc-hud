--[[
    nc-hud Theme System v2
    External resources can provide entirely new NUI/UI through this system.
    
    === How to Register a Theme ===
    exports['nc-hud']:RegisterTheme({
        id = 'my-theme',
        name = 'My Custom Theme',
        author = 'Your Name',
        version = '1.0.0',
        -- Which components to replace (true = this theme handles the component)
        replaces = {
            playerStats = true,   -- Player status (health/armor etc.)
            playerInfo = true,    -- Player info (ID/money/job etc.)
            speedometer = true,   -- Speedometer
            minimap = true,       -- Minimap
            compass = true,       -- Compass
            weaponHud = true,     -- Weapon HUD
            crosshair = true,     -- Crosshair
        },
        colors = {
            primary = '#FF0000',
            secondary = '#00FF00',
        }
    })
    
    === Receiving Data ===
    External themes receive data via the following events:
    
    AddEventHandler('nc-hud:theme:playerStatus', function(data)
        -- data = { show, health, armour, oxygen, stress, voice, voicemode, hunger, thirst }
    end)
    
    AddEventHandler('nc-hud:theme:playerInfo', function(data)
        -- data = { show, serverId, time, job, cash, bank }
    end)
    
    AddEventHandler('nc-hud:theme:vehicle', function(data)
        -- data = { show, speed, gear, rpm, fuel, ... }
    end)
    
    AddEventHandler('nc-hud:theme:compass', function(data)
        -- data = { show, direction, heading, location, ... }
    end)
    
    AddEventHandler('nc-hud:theme:weapon', function(data)
        -- data = { show, ammo, maxAmmo, weaponName, ... }
    end)
]]

---@class RegisteredTheme
---@field id string Theme unique ID
---@field name string Theme display name
---@field author string Author
---@field version string Version
---@field resource string Registering resource name
---@field replaces table Replaced component list
---@field colors table? Theme colors

---@type table<string, RegisteredTheme>
RegisteredThemes = {}

-- Currently selected theme
CurrentTheme = 'default'

-- Per-component override state (which external theme handles it)
---@type table<string, string|nil>
ComponentOverrides = {
    playerStats = nil,
    playerInfo = nil,
    speedometer = nil,
    minimap = nil,
    compass = nil,
    weaponHud = nil,
    crosshair = nil,
}

-- KVP key
local function GetThemeKvpKey()
    local endpoint = GetCurrentServerEndpoint() or 'local'
    local safeKey = endpoint:gsub('[:%.]', '_')
    return 'HudTheme:' .. safeKey
end

-- Save selected theme
local function SaveSelectedTheme()
    SetResourceKvp(GetThemeKvpKey(), CurrentTheme)
end

---Apply component override state
function ApplyThemeOverrides()
    for k in pairs(ComponentOverrides) do
        ComponentOverrides[k] = nil
    end
    
    if CurrentTheme == 'default' then
        SendHiddenComponentsToNui()
        return
    end
    
    local theme = RegisteredThemes[CurrentTheme]
    if theme and theme.replaces then
        for component, enabled in pairs(theme.replaces) do
            if enabled then
                ComponentOverrides[component] = theme.id
            end
        end
    end
    
    SendHiddenComponentsToNui()
end

-- Load selected theme
local function LoadSelectedTheme()
    local saved = GetResourceKvpString(GetThemeKvpKey())
    if saved and RegisteredThemes[saved] then
        CurrentTheme = saved
        ApplyThemeOverrides()
    else
        CurrentTheme = 'default'
    end
end

---Send hidden component list to NUI
function SendHiddenComponentsToNui()
    local hidden = {}
    for component, themeId in pairs(ComponentOverrides) do
        if themeId then
            hidden[component] = true
        end
    end
    
    NuiMessage('themeOverrides', {
        hiddenComponents = hidden,
        currentTheme = CurrentTheme,
        themeInfo = RegisteredThemes[CurrentTheme],
    })
end

-- Register default theme
RegisteredThemes['default'] = {
    id = 'default',
    name = 'NC-HUD Default',
    author = 'NOX',
    version = '1.0.0',
    resource = 'nc-hud',
    replaces = {},
    colors = {
        primary = '#f93639',
        secondary = '#00e0ff',
    },
    isDefault = true,
}

---Register theme
---@param themeData table Theme data
---@return boolean success Registration success
local function RegisterTheme(themeData)
    if not themeData or not themeData.id then
        print('[nc-hud] ^1Error: Theme registration failed - missing id^0')
        return false
    end
    
    if not themeData.name then
        print('[nc-hud] ^1Error: Theme registration failed - missing name^0')
        return false
    end
    
    local resourceName = GetInvokingResource() or 'nc-hud'
    
    local theme = {
        id = themeData.id,
        name = themeData.name,
        author = themeData.author or 'Unknown',
        version = themeData.version or '1.0.0',
        resource = resourceName,
        replaces = themeData.replaces or {},
        colors = themeData.colors or nil,
        isDefault = false,
    }
    
    RegisteredThemes[theme.id] = theme
    
    local replacesList = {}
    for k, v in pairs(theme.replaces) do
        if v then replacesList[#replacesList + 1] = k end
    end
    
    print('[nc-hud] ^2Theme registered: ^7' .. theme.name .. ' ^2by ^7' .. theme.author)
    if #replacesList > 0 then
        print('[nc-hud] ^2  Replaces: ^7' .. table.concat(replacesList, ', '))
    end
    
    -- Update theme list in NUI
    SendThemeListToNui()
    
    -- If saved theme matches the just-registered theme, apply it
    local savedTheme = GetResourceKvpString(GetThemeKvpKey())
    if savedTheme and savedTheme == theme.id then
        CurrentTheme = theme.id
        ApplyThemeOverrides()
        -- Notify external theme of activation
        TriggerEvent('nc-hud:theme:activated', theme.id)
        print('[nc-hud] ^2Theme auto-activated (saved): ^7' .. theme.name .. '^0')
    end
    
    return true
end

---Unregister theme
---@param themeId string Theme ID
---@return boolean success Unregister success
local function UnregisterTheme(themeId)
    if not themeId or themeId == 'default' then
        return false
    end
    
    if RegisteredThemes[themeId] then
        RegisteredThemes[themeId] = nil
        print('[nc-hud] ^3Theme unregistered: ^7' .. themeId .. '^0')
        
        -- If current theme was unregistered, revert to default
        if CurrentTheme == themeId then
            CurrentTheme = 'default'
            SaveSelectedTheme()
            ApplyThemeOverrides()
        end
        
        SendThemeListToNui()
        return true
    end
    
    return false
end

---Get registered theme list
---@return table themes Theme list
local function GetRegisteredThemes()
    local list = {}
    for id, theme in pairs(RegisteredThemes) do
        list[#list + 1] = {
            id = theme.id,
            name = theme.name,
            author = theme.author,
            version = theme.version,
            resource = theme.resource,
            replaces = theme.replaces,
            colors = theme.colors,
            isDefault = theme.isDefault or false,
            isActive = (CurrentTheme == id),
        }
    end
    return list
end

---Get current theme
---@return RegisteredTheme? theme Current theme
local function GetCurrentTheme()
    return RegisteredThemes[CurrentTheme]
end

---Check if a component is overridden by an external theme
---@param component string Component name
---@return boolean isOverridden Whether overridden
function IsComponentOverridden(component)
    return ComponentOverrides[component] ~= nil
end

---Select theme
---@param themeId string Theme ID
---@return boolean success Selection success
local function SelectTheme(themeId)
    if not themeId or not RegisteredThemes[themeId] then
        return false
    end
    
    local previousTheme = CurrentTheme
    
    CurrentTheme = themeId
    SaveSelectedTheme()
    ApplyThemeOverrides()
    
    -- Notify NUI of theme change
    NuiMessage('themeSelected', {
        theme = RegisteredThemes[themeId],
        hiddenComponents = ComponentOverrides,
    })
    
    -- Notify previous theme of deactivation
    if previousTheme and previousTheme ~= 'default' and previousTheme ~= themeId then
        TriggerEvent('nc-hud:theme:deactivated', previousTheme)
    end
    
    -- Notify new theme of activation
    if themeId ~= 'default' then
        TriggerEvent('nc-hud:theme:activated', themeId)
    end
    
    -- Broadcast theme change event
    TriggerEvent('nc-hud:theme:changed', {
        themeId = themeId,
        theme = RegisteredThemes[themeId],
        previousThemeId = previousTheme,
    })
    
    print('[nc-hud] ^2Theme selected: ^7' .. RegisteredThemes[themeId].name .. '^0')
    
    return true
end

---Send theme list to NUI
function SendThemeListToNui()
    NuiMessage('themeList', {
        themes = GetRegisteredThemes(),
        currentTheme = CurrentTheme,
        hiddenComponents = ComponentOverrides,
    })
end

-- ============================================================
-- Data Broadcast Functions (for external themes)
-- ============================================================

---Broadcast player status data
---@param data table Player status data
function BroadcastPlayerStatus(data)
    if IsComponentOverridden('playerStats') then
        TriggerEvent('nc-hud:theme:playerStatus', data)
    end
end

---Broadcast player info data
---@param data table Player info data
function BroadcastPlayerInfo(data)
    if IsComponentOverridden('playerInfo') then
        TriggerEvent('nc-hud:theme:playerInfo', data)
    end
end

---Broadcast vehicle/speedometer data
---@param data table Vehicle data
function BroadcastVehicle(data)
    if IsComponentOverridden('speedometer') then
        TriggerEvent('nc-hud:theme:vehicle', data)
    end
end

---Broadcast compass data
---@param data table Compass data
function BroadcastCompass(data)
    if IsComponentOverridden('compass') or IsComponentOverridden('minimap') then
        TriggerEvent('nc-hud:theme:compass', data)
    end
end

---Broadcast weapon data
---@param data table Weapon data
function BroadcastWeapon(data)
    if IsComponentOverridden('weaponHud') or IsComponentOverridden('crosshair') then
        TriggerEvent('nc-hud:theme:weapon', data)
    end
end

-- Exports
exports('RegisterTheme', RegisterTheme)
exports('UnregisterTheme', UnregisterTheme)
exports('GetRegisteredThemes', GetRegisteredThemes)
exports('GetCurrentTheme', GetCurrentTheme)
exports('SelectTheme', SelectTheme)
exports('IsComponentOverridden', IsComponentOverridden)

-- NUI Callback: Select theme
RegisterNUICallback('selectTheme', function(data, cb)
    local success = SelectTheme(data.themeId)
    cb({ success = success })
end)

-- NUI Callback: Theme list request
RegisterNUICallback('getThemeList', function(data, cb)
    local hidden = {}
    for component, themeId in pairs(ComponentOverrides) do
        if themeId then
            hidden[component] = true
        end
    end
    
    cb({
        themes = GetRegisteredThemes(),
        currentTheme = CurrentTheme,
        hiddenComponents = hidden,
    })
end)

-- NUI Callback: Open external theme settings
RegisterNUICallback('openThemeSettings', function(data, cb)
    local themeId = data.themeId
    if not themeId or themeId == 'default' then
        cb({ success = false })
        return
    end
    local theme = RegisteredThemes[themeId]
    if not theme then
        cb({ success = false })
        return
    end
    -- Forward settings open event to theme resource
    TriggerEvent('nc-hud:theme:openSettings', themeId)
    cb({ success = true })
end)

-- Load saved theme on resource start
CreateThread(function()
    Wait(500)
    LoadSelectedTheme()
    SendThemeListToNui()
end)

-- Unregister themes from stopped resources
AddEventHandler('onResourceStop', function(resourceName)
    for id, theme in pairs(RegisteredThemes) do
        if theme.resource == resourceName and id ~= 'default' then
            UnregisterTheme(id)
        end
    end
end)

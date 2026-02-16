if not (Framework == 'ox') then return end

PlayerLoaded = false

-- Update PlayerInfo
local function UpdatePlayerInfo()
    if not player then return end
    
    -- Job (Ox Core)
    local charId = player.charId
    if charId then
        -- Ox may have a different job system
        PlayerInfo.job = 'Citizen'
    end
    
    -- Get cash from Ox Inventory or other resource
    local cash = exports.ox_inventory:Search('count', 'money')
    if cash then
        PlayerInfo.cash = cash or 0
    end
    
    -- Bank requires separate implementation
end

RegisterNetEvent("ox:playerLoaded", function()
    Wait(1000)
    UpdatePlayerInfo()
    local response = LoadHud()
    if response then
        DisplayHud(GlobalSettings.showhud)
        PlayerLoaded = true
    end
end)

AddEventHandler('onResourceStart', function(resourceName)
    Wait(1000)
    if resourceName ~= GetCurrentResourceName() then return end
    if player then
        UpdatePlayerInfo()
        local response = LoadHud()
        if response then
            DisplayHud(GlobalSettings.showhud)
            PlayerLoaded = true
        end
    end
end)

AddEventHandler('ox:statusTick', function(values)
    Playerstatus.Thirst = values.thirst
    Playerstatus.Hunger = values.hunger
    Playerstatus.Stress = values.stress
end)

if not (Framework == 'esx') then return end

local ESX = exports['es_extended']:getSharedObject()
PlayerLoaded = false

-- Update PlayerInfo
local function UpdatePlayerInfo()
    local playerData = ESX.GetPlayerData()
    if not playerData then return end
    
    -- Job
    if playerData.job then
        PlayerInfo.job = playerData.job.label or 'Unemployed'
    end
    
    -- Cash & Bank
    for _, account in ipairs(playerData.accounts or {}) do
        if account.name == 'money' then
            PlayerInfo.cash = account.money or 0
        elseif account.name == 'bank' then
            PlayerInfo.bank = account.money or 0
        end
    end
end

RegisterNetEvent('esx:playerLoaded')
AddEventHandler('esx:playerLoaded', function(playerData)
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
    if ESX.IsPlayerLoaded() then
        UpdatePlayerInfo()
        local response = LoadHud()
        if response then
            DisplayHud(GlobalSettings.showhud)
            PlayerLoaded = true
        end
    end
end)


AddEventHandler('esx_status:onTick', function(data)
    for i = 1, #data do
        if data[i].name == 'thirst' then Playerstatus.Thirst = math.floor(data[i].percent) end
        if data[i].name == 'hunger' then Playerstatus.Hunger = math.floor(data[i].percent) end
        if data[i].name == 'stress' then Playerstatus.Stress = math.floor(data[i].percent) end
    end
end)

-- Money update
RegisterNetEvent('esx:setAccountMoney')
AddEventHandler('esx:setAccountMoney', function(account)
    if account.name == 'money' then
        PlayerInfo.cash = account.money or 0
    elseif account.name == 'bank' then
        PlayerInfo.bank = account.money or 0
    end
end)

-- Job update
RegisterNetEvent('esx:setJob')
AddEventHandler('esx:setJob', function(job)
    PlayerInfo.job = job.label or 'Unemployed'
end)

if not (Framework == 'qb') then return end

local QBCore = exports['qb-core']:GetCoreObject()
PlayerLoaded = false

-- Update PlayerInfo
local function UpdatePlayerInfo(playerdata)
    if not playerdata then return end
    
    -- Job
    if playerdata.job then
        PlayerInfo.job = playerdata.job.label or 'Unemployed'
    end
    
    -- Cash & Bank
    if playerdata.money then
        PlayerInfo.cash = playerdata.money.cash or 0
        PlayerInfo.bank = playerdata.money.bank or 0
    end
end

RegisterNetEvent("QBCore:Client:OnPlayerLoaded", function()
    local playerdata = QBCore.Functions.GetPlayerData()

    Playerstatus.Stress = playerdata.metadata.stress
    Playerstatus.Hunger = playerdata.metadata.hunger
    Playerstatus.Thirst = playerdata.metadata.thirst
    UpdatePlayerInfo(playerdata)

    Wait(1000)

    local response = LoadHud()
    if response then
        DisplayHud(GlobalSettings.showhud)
        PlayerLoaded = true
    end
end)

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    local playerdata = QBCore.Functions.GetPlayerData()
    if playerdata then
        Playerstatus.Stress = playerdata.metadata.stress
        Playerstatus.Hunger = playerdata.metadata.hunger
        Playerstatus.Thirst = playerdata.metadata.thirst
        UpdatePlayerInfo(playerdata)
        
        Wait(1000)

        local response = LoadHud()
        if response then
            DisplayHud(GlobalSettings.showhud)
            PlayerLoaded = true
        end
    end
end)


RegisterNetEvent('hud:client:UpdateNeeds', function(newHunger, newThirst)
    Playerstatus.Hunger = newHunger
    Playerstatus.Thirst = newThirst
end)

RegisterNetEvent('hud:client:UpdateStress', function(newStress)
    Playerstatus.Stress = newStress
end)

-- Money update
RegisterNetEvent('QBCore:Client:OnMoneyChange', function(moneyType, amount, operation)
    local playerdata = QBCore.Functions.GetPlayerData()
    if playerdata and playerdata.money then
        PlayerInfo.cash = playerdata.money.cash or 0
        PlayerInfo.bank = playerdata.money.bank or 0
    end
end)

-- Job update
RegisterNetEvent('QBCore:Client:OnJobUpdate', function(job)
    PlayerInfo.job = job.label or 'Unemployed'
end)

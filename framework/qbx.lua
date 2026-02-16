if not (Framework == 'qbx') then return end

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
    Playerstatus.Stress = QBX.PlayerData.metadata.stress
    Playerstatus.Hunger = QBX.PlayerData.metadata.hunger
    Playerstatus.Thirst = QBX.PlayerData.metadata.thirst
    UpdatePlayerInfo(QBX.PlayerData)

    Wait(1000)

    local response = LoadHud()
    if response then
        DisplayHud(GlobalSettings.showhud)
        PlayerLoaded = true
    end
end)

RegisterNetEvent("QBCore:Client:OnPlayerUnload", function()
    DisplayHud(false)
    PlayerLoaded = false
end)

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    if QBX.PlayerData then
        Playerstatus.Stress = QBX.PlayerData.metadata.stress
        Playerstatus.Hunger = QBX.PlayerData.metadata.hunger
        Playerstatus.Thirst = QBX.PlayerData.metadata.thirst
        UpdatePlayerInfo(QBX.PlayerData)

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
    if QBX.PlayerData and QBX.PlayerData.money then
        PlayerInfo.cash = QBX.PlayerData.money.cash or 0
        PlayerInfo.bank = QBX.PlayerData.money.bank or 0
    end
end)

-- Job update
RegisterNetEvent('QBCore:Client:OnJobUpdate', function(job)
    PlayerInfo.job = job.label or 'Unemployed'
end)

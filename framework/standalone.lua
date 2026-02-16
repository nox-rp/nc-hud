if not (Framework == 'standalone') then return end

PlayerLoaded = false

-- Uses default values in standalone mode
-- Can be modified as needed
PlayerInfo.job = 'Citizen'
PlayerInfo.cash = 0
PlayerInfo.bank = 0

AddEventHandler('onResourceStart', function(resourceName)
    Wait(1000)
    if resourceName ~= GetCurrentResourceName() then return end
    local response = LoadHud()
    if response then
        DisplayHud(GlobalSettings.showhud)
        PlayerLoaded = true
    end
end)

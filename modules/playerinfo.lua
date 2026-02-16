---@class PlayerInfo
PlayerInfo = {
    job = 'Unemployed',
    cash = 0,
    bank = 0,
}

local function GetGameTime()
    local hour = GetClockHours()
    local minute = GetClockMinutes()
    return string.format('%02d:%02d', hour, minute)
end

CreateThread(function()
    while not HudLoaded do
        Wait(100)
    end
    
    while true do
        local serverId = GetPlayerServerId(PlayerId())
        local time = GetGameTime()
        
        local infoData = {
            show = GlobalSettings.showplayerinfo,
            serverId = serverId,
            time = time,
            job = PlayerInfo.job,
            cash = PlayerInfo.cash,
            bank = PlayerInfo.bank,
        }
        
        if not IsComponentOverridden('playerInfo') then
            NuiMessage('playerinfo', infoData)
        end
        
        BroadcastPlayerInfo(infoData)
        
        Wait(1000)
    end
end)

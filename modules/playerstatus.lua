
---@class Playerstatus
Playerstatus = {
    voicemode = 0,
    Hunger = 0,
    Thirst = 0,
    Stress = 100,
}

local GetEntityHealth = GetEntityHealth
local GetPedArmour = GetPedArmour
local IsEntityInWater = IsEntityInWater
local GetPlayerSprintStaminaRemaining = GetPlayerSprintStaminaRemaining
local GetPlayerUnderwaterTimeRemaining = GetPlayerUnderwaterTimeRemaining

CreateThread(function()
    while not HudLoaded do
        Wait(100)
    end
    
    while true do
        local ped = cache.ped
        local playerid = cache.playerId
        local health = GetEntityHealth(ped)
        local armour = GetPedArmour(ped)
        local voice = NetworkIsPlayerTalking(playerid)
        local oxygen
        
        if IsEntityInWater(ped) then
            oxygen = GetPlayerUnderwaterTimeRemaining(playerid) * 10
        else
            oxygen = 100 - GetPlayerSprintStaminaRemaining(playerid)
        end

        local statusData = {
            show   = GlobalSettings.showplayerstatus,
            health = health - 100,
            armour = armour,
            oxygen = oxygen,
            stress = Playerstatus.Stress,
            voice = voice,
            voicemode = Playerstatus.voicemode,
            hunger = Playerstatus.Hunger,
            thirst = Playerstatus.Thirst,
        }
        
        if not IsComponentOverridden('playerStats') then
            NuiMessage('playerstatus', statusData)
        end
        
        BroadcastPlayerStatus(statusData)
        
        Wait(1200)
    end
end)

-- Voice mode events (based on Config.VoiceResource)
local voiceResource = Config.VoiceResource or 'pma-voice'

if voiceResource == 'pma-voice' then
    AddEventHandler('pma-voice:setTalkingMode', function(mode)
        Playerstatus.voicemode = mode
    end)
elseif voiceResource == 'mumble-voip' then
    AddEventHandler('MumbleVoip:SetTalkingMode', function(mode)
        Playerstatus.voicemode = mode
    end)
elseif voiceResource == 'saltychat' then
    AddEventHandler('SaltyChat_VoiceRangeChanged', function(range, index)
        Playerstatus.voicemode = index or 0
    end)
elseif voiceResource == 'tokovoip' then
    AddEventHandler('tokovoip:setTalkingMode', function(mode)
        Playerstatus.voicemode = mode
    end)
elseif voiceResource == 'custom' then
    local customEvent = Config.VoiceEvents and Config.VoiceEvents.talkingMode
    if customEvent then
        AddEventHandler(customEvent, function(mode)
            Playerstatus.voicemode = mode
        end)
    end
end



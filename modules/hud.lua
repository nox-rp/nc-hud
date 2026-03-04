local Active = false
local IsPauseMenuActive = IsPauseMenuActive

---@class hidehudcomponents
local hidehudcomponents = Config.HideHudComponents or { 6, 7, 8, 9 }

CreateThread(function()
    DisplayRadar(false)
    for i = 1,#hidehudcomponents do
        SetHudComponentSize(hidehudcomponents[i], 0, 0)
    end
    -- Hide weapon icon & ammo permanently (removes need for per-frame HideHudComponentThisFrame)
    SetHudComponentSize(2, 0, 0)
end)

---@param state boolean;
DisplayHud = function (state)
   NuiMessage('visible', state)
   DisplayRadar(state)
end

-- Cinematic Mode
local cinematicActive = false
local cinematicBarHeight = 0.0
local CINEMATIC_BAR_TARGET = 0.12
local CINEMATIC_SPEED = 0.005

---@param state boolean
SetCinematicMode = function(state)
    cinematicActive = state
    if state then
        DisplayRadar(false)
        NuiMessage('cinematic', true)
    else
        if GlobalSettings.showhud and GlobalSettings.showminimap then
            DisplayRadar(true)
            StreamMinimap()
        end
        NuiMessage('cinematic', false)
    end
end

CreateThread(function()
    while true do
        if cinematicActive then
            if cinematicBarHeight < CINEMATIC_BAR_TARGET then
                cinematicBarHeight = math.min(cinematicBarHeight + CINEMATIC_SPEED, CINEMATIC_BAR_TARGET)
            end
            DrawRect(0.5, cinematicBarHeight / 2, 1.0, cinematicBarHeight, 0, 0, 0, 255)
            DrawRect(0.5, 1.0 - cinematicBarHeight / 2, 1.0, cinematicBarHeight, 0, 0, 0, 255)
            Wait(0)
        else
            if cinematicBarHeight > 0.0 then
                cinematicBarHeight = math.max(cinematicBarHeight - CINEMATIC_SPEED, 0.0)
                DrawRect(0.5, cinematicBarHeight / 2, 1.0, cinematicBarHeight, 0, 0, 0, 255)
                DrawRect(0.5, 1.0 - cinematicBarHeight / 2, 1.0, cinematicBarHeight, 0, 0, 0, 255)
                Wait(0)
            else
                Wait(500)
            end
        end
    end
end)

CreateThread(function()
    while true do
        if GlobalSettings.showhud then
            local pausemenuactive = IsPauseMenuActive()

            if pausemenuactive and not Active then
                NuiMessage('visible', Active)
                Active = true
            elseif not pausemenuactive and Active then
                StreamMinimap()
                NuiMessage('visible', Active)
                Active = false
            end
        end
        Wait(1000)
    end
end)

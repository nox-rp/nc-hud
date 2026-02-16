local resolutions = lib.load('data.resolutions')

local GetActualScreenResolution = GetActualScreenResolution
local RequestStreamedTextureDict = RequestStreamedTextureDict
local HasStreamedTextureDictLoaded = HasStreamedTextureDictLoaded
local SetMinimapComponentPosition = SetMinimapComponentPosition
local SetBlipAlpha = SetBlipAlpha
local GetNorthRadarBlip = GetNorthRadarBlip
local SetRadarBigmapEnabled = SetRadarBigmapEnabled
local RequestScaleformMovie = RequestScaleformMovie
local BeginScaleformMovieMethod = BeginScaleformMovieMethod
local EndScaleformMovieMethod = EndScaleformMovieMethod



---@class NuiRes
NuiRes = {
    width = 203,
    height = 245
}

-- Actual minimap position storage
MinimapPosition = {
    x = 0,
    y = 0,
    w = 0,
    h = 0,
    sizex = 0,
    sizey = 0,
    dir = 'L',
    anchor = 'B'
}

---@class defaultres
local defaultres = {
    sizex = 203,
    sizey = 245,
    posx = 0,
    posy = -0.019,
}

---@return table
local function CalculateMinimap()
    local screenx, screeny = GetActualScreenResolution()
    local res = defaultres
    for i = 1, #resolutions do
        if resolutions[i].screenx == screenx and resolutions[i].screeny == screeny then
            res = resolutions[i]
            break;
        end
    end

    return res
end

---@return boolean
StreamMinimap = function()
    local dimensions = CalculateMinimap()
    local dir = GlobalSettings.minimapLeft and 'L' or 'R'
    local dit = 'B'
    local map = GlobalSettings.circlemap and 'circlemap' or 'squaremap'


    Wait(1000)
    RequestStreamedTextureDict(map, false)
    while not HasStreamedTextureDictLoaded(map) do
        Wait(100)
    end
    SetBlipAlpha(GetNorthRadarBlip(), 0)
    AddReplaceTexture("platform:/textures/graphics", "radarmasksm", map, "radarmasksm")

    SetMinimapClipType(GlobalSettings.circlemap and 1 or 0)

    local w, h = 0.111, 0.245

    if GlobalSettings.circlemap then
        SetMinimapComponentPosition('minimap', dir, dit, dimensions.posx, dimensions.posy, w, h)
        SetMinimapComponentPosition('minimap_mask', dir, dit, dimensions.posx, dimensions.posy, w, h)
        SetMinimapComponentPosition('minimap_blur', dir, dit, dimensions.posx, dimensions.posy, w, h)
        MinimapPosition.x = dimensions.posx
        MinimapPosition.y = dimensions.posy
        MinimapPosition.w = w
        MinimapPosition.h = h
        MinimapPosition.dir = dir
        MinimapPosition.anchor = dit
    else
        SetMinimapComponentPosition('minimap', dir, dit, dimensions.posx, dimensions.posy, w, h)
        SetMinimapComponentPosition('minimap_mask', dir, dit, dimensions.posx, dimensions.posy, w, h)
        SetMinimapComponentPosition('minimap_blur', dir, dit, dimensions.posx, dimensions.posy, w, h)
        MinimapPosition.x = dimensions.posx
        MinimapPosition.y = dimensions.posy
        MinimapPosition.w = w
        MinimapPosition.h = h
        MinimapPosition.dir = dir
        MinimapPosition.anchor = dit
    end
    
    -- Store pixel size
    MinimapPosition.sizex = dimensions.sizex + (GlobalSettings.circlemap and 75 or 0)
    MinimapPosition.sizey = dimensions.sizey

    SetRadarBigmapEnabled(true, false)
    Wait(0)
    SetRadarBigmapEnabled(false, false)

    
    NuiRes = {
        width = dimensions.sizex + (GlobalSettings.circlemap and 75 or 0),
        height = dimensions.sizey
    }
    return true
end

-- Calculate actual visible minimap position (screen ratio coordinates)
---@return table Actual minimap screen position
function GetMinimapScreenPosition()
    if MinimapPosition.w == 0 then
        return nil
    end
    
    local safezone = GetSafeZoneSize()
    local x = MinimapPosition.x
    local y = MinimapPosition.y
    local w = MinimapPosition.w
    local h = MinimapPosition.h
    local dir = MinimapPosition.dir
    local anchor = MinimapPosition.anchor
    
    -- SafeZone boundary calculation
    local safeLeft = (1.0 - safezone) / 2
    local safeRight = 1.0 - safeLeft
    local safeTop = (1.0 - safezone) / 2
    local safeBottom = 1.0 - safeTop
    local safeWidth = safezone
    local safeHeight = safezone
    
    local screenLeft, screenRight, screenTop, screenBottom
    
    -- X-axis alignment (L/R)
    if dir == 'L' then
        screenLeft = safeLeft + (x * safeWidth)
        screenRight = screenLeft + w
    else
        screenRight = safeRight - (x * safeWidth)
        screenLeft = screenRight - w
    end
    
    -- Y-axis alignment (T/B)
    if anchor == 'T' then
        screenTop = safeTop + (y * safeHeight)
        screenBottom = screenTop + h
    else
        screenBottom = safeBottom + (y * safeHeight)
        screenTop = screenBottom - h
    end
    
    return {
        left = screenLeft,
        right = screenRight,
        top = screenTop,
        bottom = screenBottom,
        width = w,
        height = h,
        dir = dir,
        anchor = anchor
    }
end

-- -- 디버그: 미니맵 위치 표시 (DrawRect 사용) - 실제 설정된 값 사용
-- CreateThread(function()
--     while true do
--         -- MinimapPosition이 설정되었는지 확인
--         if MinimapPosition.w > 0 then
--             local safezone = GetSafeZoneSize()
--             local aspectRatio = GetAspectRatio(false)
            
--             -- 실제 설정된 값 사용 (SetMinimapComponentPosition에 전달된 값)
--             local x = MinimapPosition.x
--             local y = MinimapPosition.y
--             local w = MinimapPosition.w  -- 실제 미니맵 너비
--             local h = MinimapPosition.h  -- 실제 미니맵 높이
--             local dir = MinimapPosition.dir  -- 정렬 방향 (L/R)
--             local anchor = MinimapPosition.anchor  -- 앵커 방향 (T/B)
            
--             -- SafeZone 경계 계산
--             local safeLeft = (1.0 - safezone) / 2
--             local safeRight = 1.0 - safeLeft
--             local safeTop = (1.0 - safezone) / 2
--             local safeBottom = 1.0 - safeTop
--             local safeWidth = safezone
--             local safeHeight = safezone
            
--             local screenLeft, screenRight, screenTop, screenBottom
            
--             -- X축 정렬 (L/R)
--             if dir == 'L' then
--                 screenLeft = safeLeft + (x * safeWidth)
--                 screenRight = screenLeft + w
--             else
--                 screenRight = safeRight - (x * safeWidth)
--                 screenLeft = screenRight - w
--             end
            
--             -- Y축 정렬 (T/B)
--             if anchor == 'T' then
--                 screenTop = safeTop + (y * safeHeight)
--                 screenBottom = screenTop + h
--             else
--                 screenBottom = safeBottom + (y * safeHeight)
--                 screenTop = screenBottom - h
--             end
            
--             -- DrawRect는 중앙 좌표 기준
--             local centerX = screenLeft + (w / 2)
--             local centerY = screenTop + (h / 2)
            
--             -- 빨간 테두리 사각형 그리기
--             DrawRect(centerX, centerY, w, h, 255, 0, 0, 150)
            
--             -- 디버그 정보 표시
--             DrawText2D(0.01, 0.01, "Dir: " .. dir .. " Anchor: " .. anchor .. " SafeZone: " .. string.format("%.3f", safezone), 0.3)
--             DrawText2D(0.01, 0.03, "X: " .. string.format("%.3f", x) .. " Y: " .. string.format("%.3f", y), 0.3)
--             DrawText2D(0.01, 0.05, "W: " .. string.format("%.3f", w) .. " H: " .. string.format("%.3f", h), 0.3)
--             DrawText2D(0.01, 0.07, "ScreenL: " .. string.format("%.3f", screenLeft) .. " ScreenR: " .. string.format("%.3f", screenRight), 0.3)
--             DrawText2D(0.01, 0.09, "ScreenT: " .. string.format("%.3f", screenTop) .. " ScreenB: " .. string.format("%.3f", screenBottom), 0.3)
            
--             -- 모서리 표시
--             DrawText2D(screenLeft, screenTop, "TL", 0.35)
--             DrawText2D(screenRight, screenTop, "TR", 0.35)
--             DrawText2D(screenLeft, screenBottom, "BL", 0.35)
--             DrawText2D(screenRight, screenBottom, "BR", 0.35)
--         end
        
--         Wait(0)
--     end
-- end)

-- 화면에 텍스트 그리기
function DrawText2D(x, y, text, scale)
    SetTextFont(4)
    SetTextProportional(false)
    SetTextScale(scale, scale)
    SetTextColour(255, 0, 0, 255)
    SetTextDropshadow(0, 0, 0, 0, 255)
    SetTextEdge(2, 0, 0, 0, 150)
    SetTextDropShadow()
    SetTextOutline()
    SetTextEntry("STRING")
    AddTextComponentString(text)
    DrawText(x, y)
end

MinimapDebug = false
CircleMapScale = (Config.Minimap and Config.Minimap.circleMapScale) or 0.83

RegisterCommand('minimapdebug', function()
    MinimapDebug = not MinimapDebug
    print('[nc-hud] Minimap Debug: ' .. tostring(MinimapDebug))
end, false)

RegisterCommand('minimapscale', function(source, args)
    local scale = tonumber(args[1])
    if scale and scale > 0 and scale <= 2 then
        CircleMapScale = scale
        print('[nc-hud] Circle Map Scale: ' .. string.format("%.2f", CircleMapScale))
    else
        print('[nc-hud] Usage: /minimapscale 0.1~2.0 (current: ' .. string.format("%.2f", CircleMapScale) .. ')')
    end
end, false)

local function DrawCircle2D(centerX, centerY, radiusX, radiusY, segments, r, g, b, a)
    local lastX, lastY
    for i = 0, segments do
        local angle = (i / segments) * (2 * math.pi)
        local x = centerX + math.cos(angle) * radiusX
        local y = centerY + math.sin(angle) * radiusY
        if lastX and lastY then
            DrawLine(lastX, lastY, 0, x, y, 0, r, g, b, a)
        end
        lastX, lastY = x, y
    end
end

local function DrawCircleOutline2D(centerX, centerY, radius, segments, r, g, b, a)
    local aspectRatio = GetAspectRatio(false)
    for i = 0, segments - 1 do
        local angle1 = (i / segments) * (2 * math.pi)
        local angle2 = ((i + 1) / segments) * (2 * math.pi)
        
        local x1 = centerX + math.cos(angle1) * (radius / aspectRatio)
        local y1 = centerY + math.sin(angle1) * radius
        local x2 = centerX + math.cos(angle2) * (radius / aspectRatio)
        local y2 = centerY + math.sin(angle2) * radius
        
        local midX = (x1 + x2) / 2
        local midY = (y1 + y2) / 2
        local lineLength = math.sqrt((x2 - x1)^2 + (y2 - y1)^2) * 1.1
        local lineAngle = math.atan(y2 - y1, x2 - x1)
        
        DrawRect(midX, midY, lineLength, 0.002, r, g, b, a)
    end
end

CreateThread(function()
    while true do
        if MinimapDebug and MinimapPosition.w > 0 then
            local safezone = GetSafeZoneSize()
            local aspectRatio = GetAspectRatio(false)
            
            local x = MinimapPosition.x
            local y = MinimapPosition.y
            local w = MinimapPosition.w
            local h = MinimapPosition.h
            local dir = MinimapPosition.dir
            local anchor = MinimapPosition.anchor
            
            -- SafeZone boundary calculation
            local safeLeft = (1.0 - safezone) / 2
            local safeRight = 1.0 - safeLeft
            local safeTop = (1.0 - safezone) / 2
            local safeBottom = 1.0 - safeTop
            local safeWidth = safezone
            local safeHeight = safezone
            
            local screenLeft, screenRight, screenTop, screenBottom
            
            -- X-axis alignment (L/R)
            if dir == 'L' then
                screenLeft = safeLeft + (x * safeWidth)
                screenRight = screenLeft + w
            else
                screenRight = safeRight - (x * safeWidth)
                screenLeft = screenRight - w
            end
            
            -- Y-axis alignment (T/B)
            if anchor == 'T' then
                screenTop = safeTop + (y * safeHeight)
                screenBottom = screenTop + h
            else
                screenBottom = safeBottom + (y * safeHeight)
                screenTop = screenBottom - h
            end
            
            local centerX = screenLeft + (w / 2)
            local centerY = screenTop + (h / 2)
            
            if GlobalSettings.circlemap then
                -- Circle minimap debug
                local screenW, screenH = GetActualScreenResolution()
                
                local radius = (h / 2) * CircleMapScale
                local radiusX = radius / aspectRatio
                
                for i = 0, 127 do
                    local angle1 = (i / 128) * (2 * math.pi)
                    local angle2 = ((i + 1) / 128) * (2 * math.pi)
                    
                    local x1 = centerX + math.cos(angle1) * radiusX
                    local y1 = centerY + math.sin(angle1) * radius
                    local x2 = centerX + math.cos(angle2) * radiusX
                    local y2 = centerY + math.sin(angle2) * radius
                    
                    local midX = (x1 + x2) / 2
                    local midY = (y1 + y2) / 2
                    DrawRect(midX, midY, 0.003, 0.003, 255, 0, 0, 255)
                end
                
                -- Center point
                DrawRect(centerX, centerY, 0.004, 0.004, 0, 255, 0, 255)
                
                local pixelCenterX = centerX * screenW
                local pixelCenterY = centerY * screenH
                local pixelDiameter = radius * 2 * screenH
                local pixelRadius = pixelDiameter / 2
                
                local pixelLeft = pixelCenterX - pixelRadius
                local pixelTop = pixelCenterY - pixelRadius
                local pixelRight = pixelCenterX + pixelRadius
                local pixelBottom = pixelCenterY + pixelRadius
                
                -- NUI coordinate display
                DrawText2D(0.01, 0.01, "=== CIRCLE MINIMAP DEBUG ===", 0.35)
                DrawText2D(0.01, 0.04, "Scale: " .. string.format("%.2f", CircleMapScale) .. " (/minimapscale 0.1~2.0)", 0.3)
                DrawText2D(0.01, 0.065, "Screen: " .. screenW .. " x " .. screenH, 0.3)
                DrawText2D(0.01, 0.095, "------- PIXEL VALUES -------", 0.3)
                DrawText2D(0.01, 0.12, "Center X: " .. string.format("%.1f", pixelCenterX) .. " px", 0.3)
                DrawText2D(0.01, 0.145, "Center Y: " .. string.format("%.1f", pixelCenterY) .. " px", 0.3)
                DrawText2D(0.01, 0.17, "Diameter: " .. string.format("%.1f", pixelDiameter) .. " px", 0.3)
                DrawText2D(0.01, 0.195, "Radius: " .. string.format("%.1f", pixelRadius) .. " px", 0.3)
                DrawText2D(0.01, 0.225, "------- BOUNDING BOX -------", 0.3)
                DrawText2D(0.01, 0.25, "Left: " .. string.format("%.1f", pixelLeft) .. " px", 0.3)
                DrawText2D(0.01, 0.275, "Top: " .. string.format("%.1f", pixelTop) .. " px", 0.3)
                DrawText2D(0.01, 0.3, "Right: " .. string.format("%.1f", pixelRight) .. " px", 0.3)
                DrawText2D(0.01, 0.325, "Bottom: " .. string.format("%.1f", pixelBottom) .. " px", 0.3)
                DrawText2D(0.01, 0.355, "------- NUI CSS -------", 0.3)
                DrawText2D(0.01, 0.38, "left: " .. string.format("%.1f", pixelLeft) .. "px", 0.3)
                DrawText2D(0.01, 0.405, "top: " .. string.format("%.1f", pixelTop) .. "px", 0.3)
                DrawText2D(0.01, 0.43, "width/height: " .. string.format("%.1f", pixelDiameter) .. "px", 0.3)
                DrawText2D(0.01, 0.455, "border-radius: 50%", 0.3)
                
                CircleMinimapData = {
                    centerX = pixelCenterX,
                    centerY = pixelCenterY,
                    diameter = pixelDiameter,
                    radius = pixelRadius,
                    left = pixelLeft,
                    top = pixelTop,
                    right = pixelRight,
                    bottom = pixelBottom,
                    scale = CircleMapScale
                }
            else
                -- Square minimap debug
                DrawRect(centerX, centerY, w, h, 255, 0, 0, 100)
                
                DrawText2D(0.01, 0.01, "SQUARE MINIMAP DEBUG", 0.35)
                DrawText2D(0.01, 0.03, "Dir: " .. dir .. " Anchor: " .. anchor, 0.3)
                DrawText2D(0.01, 0.05, "X: " .. string.format("%.4f", x) .. " Y: " .. string.format("%.4f", y), 0.3)
                DrawText2D(0.01, 0.07, "W: " .. string.format("%.4f", w) .. " H: " .. string.format("%.4f", h), 0.3)
                DrawText2D(0.01, 0.09, "Left: " .. string.format("%.4f", screenLeft) .. " Right: " .. string.format("%.4f", screenRight), 0.3)
                DrawText2D(0.01, 0.11, "Top: " .. string.format("%.4f", screenTop) .. " Bottom: " .. string.format("%.4f", screenBottom), 0.3)
                
                -- Corner labels
                DrawText2D(screenLeft, screenTop, "TL", 0.3)
                DrawText2D(screenRight - 0.02, screenTop, "TR", 0.3)
                DrawText2D(screenLeft, screenBottom - 0.02, "BL", 0.3)
                DrawText2D(screenRight - 0.02, screenBottom - 0.02, "BR", 0.3)
            end
        end
        
        Wait(0)
    end
end)

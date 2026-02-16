
---@return string
local GetPlayerDirection = function (dgr)
    if (dgr >= 0.0 and dgr < 22.5) or dgr >= 337.5 then
        return 'N'
    elseif dgr >= 22.5 and dgr < 67.5 then
        return 'NE'
    elseif dgr >= 67.5 and dgr < 112.5 then
        return 'E'
    elseif dgr >= 112.5 and dgr < 157.5 then
        return 'SE'
    elseif dgr >= 157.5 and dgr < 202.5 then
        return 'S'
    elseif dgr >= 202.5 and dgr < 247.5 then
        return 'SW'
    elseif dgr >= 247.5 and dgr < 292.5 then
        return 'W'
    elseif dgr >= 292.5 and dgr < 337.5 then
        return 'NW'
    end
end 

-- Postal system (load postals.json)
local postals = nil

CreateThread(function()
    local resourceName = GetCurrentResourceName()
    local rawData = LoadResourceFile(resourceName, 'data/postals.json')
    
    if rawData then
        local decoded = json.decode(rawData)
        if decoded then
            postals = {}
            for i, postal in ipairs(decoded) do
                local x = postal.x or postal.X
                local y = postal.y or postal.Y
                if x and y then
                    postals[i] = { 
                        coords = vector2(x, y), 
                        code = tostring(postal.code)
                    }
                end
            end
            print('[nc-hud] Postals loaded: ' .. #postals .. ' entries')
        end
    end
end)

-- Find nearest postal
local function GetNearestPostal(playerCoords)
    if not postals or #postals == 0 then return nil end
    
    local nearestCode = nil
    local nearestDist = math.huge
    local coords2d = vector2(playerCoords.x, playerCoords.y)
    
    for i = 1, #postals do
        local dist = #(coords2d - postals[i].coords)
        if dist < nearestDist then
            nearestDist = dist
            nearestCode = postals[i].code
        end
    end
    
    return nearestCode
end

CreateThread(function()
    while true do
        local ped = cache.ped
        local coords = GetEntityCoords(ped)
        local street1,street2 = GetStreetNameAtCoord(coords.x,coords.y,coords.z)
        local streetname = GetStreetNameFromHashKey(street2)
        if street2 == 0 then
            streetname = GetStreetNameFromHashKey(street1)
        end
        local dgr = (360.0 - GetGameplayCamRot(0).z) % 360.0
        local direction = GetPlayerDirection(dgr)
        
        -- Postal code
        local postalCode = GetNearestPostal(coords)
        
        -- Minimap screen position calculation
        local minimapPos = GetMinimapScreenPosition()
        local screenW, screenH = GetActualScreenResolution()
        
        -- Calculate exact circle size for circle minimap
        local circleData = nil
        if GlobalSettings.circlemap and MinimapPosition.w > 0 then
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
            
            if dir == 'L' then
                screenLeft = safeLeft + (x * safeWidth)
                screenRight = screenLeft + w
            else
                screenRight = safeRight - (x * safeWidth)
                screenLeft = screenRight - w
            end
            
            if anchor == 'T' then
                screenTop = safeTop + (y * safeHeight)
                screenBottom = screenTop + h
            else
                screenBottom = safeBottom + (y * safeHeight)
                screenTop = screenBottom - h
            end
            
            local centerX = screenLeft + (w / 2)
            local centerY = screenTop + (h / 2)
            
            -- Circle radius (same scale as debug)
            local scale = CircleMapScale or 0.83
            local radius = (h / 2) * scale
            
            -- Pixel coordinate calculation
            local pixelCenterX = centerX * screenW
            local pixelCenterY = centerY * screenH
            local pixelDiameter = radius * 2 * screenH
            local pixelRadius = pixelDiameter / 2
            
            circleData = {
                centerX = pixelCenterX,
                centerY = pixelCenterY,
                diameter = pixelDiameter,
                radius = pixelRadius,
                left = pixelCenterX - pixelRadius,
                top = pixelCenterY - pixelRadius,
            }
        end
        
        local compassData = {
            show = GlobalSettings.showminimap,
            circlemap = GlobalSettings.circlemap,
            streetname = streetname,
            direction = direction,
            postalCode = postalCode,
            heading = dgr,
            width = GlobalSettings.circlemap and (circleData and circleData.diameter or NuiRes.width) or NuiRes.width,
            height = GlobalSettings.circlemap and (circleData and circleData.diameter or NuiRes.height) or NuiRes.height,
            -- Minimap position info (pixel values)
            position = minimapPos and {
                left = GlobalSettings.circlemap and (circleData and circleData.left or (minimapPos.left * screenW)) or (minimapPos.left * screenW),
                top = GlobalSettings.circlemap and (circleData and circleData.top or (minimapPos.top * screenH)) or (minimapPos.top * screenH),
                dir = minimapPos.dir,
                anchor = minimapPos.anchor
            } or nil,
            circleData = circleData
        }
        
        if not IsComponentOverridden('minimap') and not IsComponentOverridden('compass') then
            NuiMessage('compass', compassData)
        end
        
        BroadcastCompass(compassData)
        
        Wait(50)
    end
end)
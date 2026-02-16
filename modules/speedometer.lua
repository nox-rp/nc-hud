local vehicle,seatbelt = false,false

local GetEntitySpeed = GetEntitySpeed
local GetVehicleFuelLevel = GetVehicleFuelLevel
local GetVehicleClass = GetVehicleClass
local SetFlyThroughWindscreenParams = SetFlyThroughWindscreenParams
local GetVehicleCurrentRpm = GetVehicleCurrentRpm
local GetVehicleEngineHealth = GetVehicleEngineHealth
local GetVehicleBodyHealth = GetVehicleBodyHealth

-- Get fuel level based on Config.FuelResource
local function GetFuel(veh)
    local resource = Config.FuelResource or 'default'
    
    if resource == 'custom' then
        local ok, result = pcall(Config.GetCustomFuel, veh)
        return ok and math.ceil(result) or 0
    end
    
    if resource == 'default' then
        return math.ceil(GetVehicleFuelLevel(veh))
    end
    
    -- Call external resource export
    if GetResourceState(resource) == 'started' then
        local ok, result = pcall(function()
            if resource == 'LegacyFuel' then
                return exports['LegacyFuel']:GetFuel(veh)
            elseif resource == 'ox_fuel' then
                return GetVehicleFuelLevel(veh) -- ox_fuel uses native override
            elseif resource == 'ps-fuel' then
                return exports['ps-fuel']:GetFuel(veh)
            elseif resource == 'cdn-fuel' then
                return exports['cdn-fuel']:GetFuel(veh)
            elseif resource == 'lj-fuel' then
                return exports['lj-fuel']:GetFuel(veh)
            elseif resource == 'okokGasStation' then
                return exports['okokGasStation']:GetFuel(veh)
            elseif resource == 'ti_fuel' then
                return exports['ti_fuel']:getFuel(veh)
            elseif resource == 'myFuel' then
                return exports['myFuel']:GetFuel(veh)
            elseif resource == 'x-fuel' then
                return exports['x-fuel']:GetFuel(veh)
            elseif resource == 'BigDaddy-Fuel' then
                return exports['BigDaddy-Fuel']:GetFuel(veh)
            elseif resource == 'hyon_gas_station' then
                return exports['hyon_gas_station']:GetFuel(veh)
            end
            return GetVehicleFuelLevel(veh)
        end)
        return ok and math.ceil(result) or math.ceil(GetVehicleFuelLevel(veh))
    end
    
    -- Fallback to default
    return math.ceil(GetVehicleFuelLevel(veh))
end

local indicatorLeft = false
local indicatorRight = false
local warningLights = false
local lightsState = 0

local currentHeartRate = 72.0
local lastHealth = 200
local lastSpeed = 0
local hrSpikeTimer = 0

local function GetWaypointDistance()
    local waypoint = GetFirstBlipInfoId(8)
    if DoesBlipExist(waypoint) then
        local waypointCoords = GetBlipCoords(waypoint)
        local playerCoords = GetEntityCoords(PlayerPedId())
        local distance = #(playerCoords - waypointCoords)
        return distance, true
    end
    return 0, false
end

local function ToggleIndicatorLeft()
    if not vehicle then return end
    indicatorRight = false
    warningLights = false
    indicatorLeft = not indicatorLeft
    SetVehicleIndicatorLights(vehicle, 1, indicatorLeft)
    SetVehicleIndicatorLights(vehicle, 0, false)
end

local function ToggleIndicatorRight()
    if not vehicle then return end
    indicatorLeft = false
    warningLights = false
    indicatorRight = not indicatorRight
    SetVehicleIndicatorLights(vehicle, 0, indicatorRight)
    SetVehicleIndicatorLights(vehicle, 1, false)
end

local function ToggleWarningLights()
    if not vehicle then return end
    indicatorLeft = false
    indicatorRight = false
    warningLights = not warningLights
    SetVehicleIndicatorLights(vehicle, 0, warningLights)
    SetVehicleIndicatorLights(vehicle, 1, warningLights)
end


AddEventHandler('onResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    Wait(500)
    local ped = PlayerPedId()
    local currentVehicle = GetVehiclePedIsIn(ped, false)
    if currentVehicle and currentVehicle ~= 0 then
        vehicle = currentVehicle
    end
end)

CreateThread(function()
    while true do
        local sleep = 1000
        local incar = vehicle and true or false
        local showspeedometer = GlobalSettings.showspeedometer == true and incar or false

        if incar then
            sleep = 50
            local speed = math.ceil(GetEntitySpeed(vehicle) * (GlobalSettings.speedunitmph and 2.2 or 3.6))
            local fuel = GetFuel(vehicle)
            local rpm = GetVehicleCurrentRpm(vehicle)
            local gear = GetVehicleCurrentGear(vehicle)
            
            -- Single-gear vehicle (electric etc.) RPM: use speed-based calculation
            local maxGear = GetVehicleHighGear(vehicle)
            if maxGear <= 1 then
                local entitySpeed = GetEntitySpeed(vehicle) -- m/s
                local maxSpeed = GetVehicleEstimatedMaxSpeed(vehicle) -- m/s
                if maxSpeed > 0 then
                    rpm = math.min(1.0, entitySpeed / maxSpeed)
                end
                gear = 1
            end
            
            -- Engine/body health (0-1000 -> 0-100%)
            local engineHealth = math.max(0, math.min(100, math.floor(GetVehicleEngineHealth(vehicle) / 10)))
            local bodyHealth = math.max(0, math.min(100, math.floor(GetVehicleBodyHealth(vehicle) / 10)))
            
            -- Waypoint distance
            local distance, hasWaypoint = GetWaypointDistance()
            
            local currentLights = 0
            local retval, lightsOn, highbeamsOn = GetVehicleLightsState(vehicle)
            if highbeamsOn == 1 or highbeamsOn == true then
                currentLights = 2
            elseif lightsOn == 1 or lightsOn == true then
                currentLights = 1
            end
            
            local engineOn = GetIsVehicleEngineRunning(vehicle)
            local lockStatus = GetVehicleDoorLockStatus(vehicle)
            local locked = lockStatus == 2
            local handbrake = GetVehicleHandbrake(vehicle)
            local vehicleClass = GetVehicleClass(vehicle)
            
            -- Electric vehicle detection
            local petrolTankVolume = GetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fPetrolTankVolume')
            local isElectric = petrolTankVolume <= (Config.ElectricVehicleThreshold or 1.0)
            
            -- Altitude (Z coordinate)
            local ped = PlayerPedId()
            local coords = GetEntityCoords(ped)
            local elevation = math.floor(coords.z)
            
            -- Flight data (helicopter: 15, plane: 16)
            local heading = math.floor((360.0 - GetEntityHeading(vehicle)) % 360.0)
            local pitch = math.floor(GetEntityPitch(vehicle))
            local roll = math.floor(GetEntityRoll(vehicle))
            local landingGear = 0 -- 0=deployed, 1=closing, ...5=retracted
            local isStalling = false
            if vehicleClass == 15 or vehicleClass == 16 then
                landingGear = GetLandingGearState(vehicle)
                -- Stall detection: very low speed + high altitude
                local verticalSpeed = GetEntitySpeedVector(vehicle, true).y
                if vehicleClass == 16 and speed < 30 and elevation > 50 and verticalSpeed < -5 then
                    isStalling = true
                end
            end
            
            -- Heart rate tracking
            local health = GetEntityHealth(ped)
            local stamina = GetPlayerStamina(PlayerId())
            
            -- Calculate target heart rate
            local hr = Config.HeartRate or {}
            local baseHR = hr.baseRate or 72
            local targetHR = baseHR
            
            if vehicleClass == 13 then
                -- Bicycle: stamina decreases while pedaling
                targetHR = baseHR + (100 - stamina) * 1.3
            end
            
            -- Health decrease detected (hit/collision) -> heart rate spike
            if health < lastHealth then
                local damage = lastHealth - health
                hrSpikeTimer = math.max(hrSpikeTimer, damage * 0.15)
                currentHeartRate = math.min(hr.maxRate or 195, currentHeartRate + damage * (hr.damageMultiplier or 0.8))
            end
            lastHealth = health
            
            -- Sudden deceleration detected (collision) -> heart rate rise
            local speedDiff = lastSpeed - speed
            if speedDiff > (hr.decelThreshold or 30) then
                hrSpikeTimer = math.max(hrSpikeTimer, 3.0)
                currentHeartRate = math.min(hr.maxRate or 195, currentHeartRate + speedDiff * 0.5)
            end
            lastSpeed = speed
            
            -- Spike timer handling
            if hrSpikeTimer > 0 then
                hrSpikeTimer = hrSpikeTimer - 0.05
                targetHR = math.max(targetHR, hr.spikeMin or 120)
            end
            
            -- Smooth interpolation toward target (rise fast, fall slow)
            if targetHR > currentHeartRate then
                currentHeartRate = currentHeartRate + (targetHR - currentHeartRate) * (hr.riseSpeed or 0.15)
            else
                currentHeartRate = currentHeartRate + (targetHR - currentHeartRate) * (hr.fallSpeed or 0.02)
            end
            
            currentHeartRate = math.max(hr.minRate or 60, math.min(hr.maxRate or 195, currentHeartRate))
            local heartRate = math.floor(currentHeartRate)
            
            local data = {
                show = showspeedometer,
                speed = speed,
                fuel = fuel,
                rpm = rpm,
                gear = gear,
                engine = engineHealth,
                body = bodyHealth,
                seatbelt = not seatbelt,
                unit = GlobalSettings.speedunitmph,
                distance = distance,
                hasWaypoint = hasWaypoint,
                -- Status icons
                indicatorLeft = indicatorLeft,
                indicatorRight = indicatorRight,
                warningLights = warningLights,
                lights = currentLights,
                engineOn = engineOn,
                locked = locked,
                handbrake = handbrake,
                vehicleClass = vehicleClass,
                isElectric = isElectric,
                -- Bicycle/motorcycle
                elevation = elevation,
                heartRate = heartRate,
                -- Plane/helicopter
                heading = heading,
                pitch = pitch,
                roll = roll,
                landingGear = landingGear,
                isStalling = isStalling
            }
            
            if not IsComponentOverridden('speedometer') then
                NuiMessage('speedometer', data)
            end
            
            BroadcastVehicle(data)
        else

            indicatorLeft = false
            indicatorRight = false
            warningLights = false
            local hideData = {show = showspeedometer}
            if not IsComponentOverridden('speedometer') then
                NuiMessage('speedometer', hideData)
            end
            BroadcastVehicle(hideData)
        end

        
        Wait(sleep)
    end
end)

---@return boolean
local VehicleTypeCheck = function()
    local class = GetVehicleClass(vehicle)
    if class == (8 and 13 and 14) then
        return false
    end
    return true
end


local ToggleSeatbelt = function()
    if vehicle then
        if VehicleTypeCheck(vehicle) then
            seatbelt = not seatbelt
            if seatbelt then
                SetFlyThroughWindscreenParams(1000.0, 1000.0, 0.0, 0.0)
            else
                SetFlyThroughWindscreenParams(15.0, 20.0, 17.0, -500.0)
            end
        end
    end
end



lib.addKeybind({
    name = 'seatbelt',
    description = 'Toggle vehicle seatbelt',
    defaultKey = Config.Keybinds.seatbelt or 'b',
    onPressed = function(self)
        ToggleSeatbelt()
    end,
})

-- Indicator keybinds
lib.addKeybind({
    name = 'indicator_left',
    description = 'Left Turn Signal',
    defaultKey = Config.Keybinds.indicatorLeft or 'LEFT',
    onPressed = function(self)
        ToggleIndicatorLeft()
    end,
})

lib.addKeybind({
    name = 'indicator_right',
    description = 'Right Turn Signal',
    defaultKey = Config.Keybinds.indicatorRight or 'RIGHT',
    onPressed = function(self)
        ToggleIndicatorRight()
    end,
})

lib.addKeybind({
    name = 'warning_lights',
    description = 'Hazard Lights',
    defaultKey = Config.Keybinds.warningLights or 'DOWN',
    onPressed = function(self)
        ToggleWarningLights()
    end,
})

lib.onCache('vehicle', function(vehicledata)
    vehicle = vehicledata
    if not vehicledata then
        indicatorLeft = false
        indicatorRight = false
        warningLights = false
    end
end)

-- Exports

--[[
    GTA V Vehicle Classes:
    0  = Compacts       | 10 = Industrial
    1  = Sedans         | 11 = Utility
    2  = SUVs           | 12 = Vans
    3  = Coupes         | 13 = Cycles
    4  = Muscle         | 14 = Boats
    5  = Sports Classics| 15 = Helicopters
    6  = Sports         | 16 = Planes
    7  = Super          | 17 = Service
    8  = Motorcycles    | 18 = Emergency
    9  = Off-road       | 19 = Military
                        | 20 = Commercial
                        | 21 = Trains
]]

--- Returns the vehicle class (category) of the currently occupied vehicle
--- @return number|nil vehicleClass Vehicle class number (0-21), nil if not in vehicle
exports('GetVehicleCategory', function()
    if not vehicle then return nil end
    return GetVehicleClass(vehicle)
end)

--- Returns the vehicle class name of the currently occupied vehicle
--- @return string|nil categoryName Category name, nil if not in vehicle
exports('GetVehicleCategoryName', function()
    if not vehicle then return nil end
    local classNames = {
        [0] = 'Compacts', [1] = 'Sedans', [2] = 'SUVs', [3] = 'Coupes',
        [4] = 'Muscle', [5] = 'Sports Classics', [6] = 'Sports', [7] = 'Super',
        [8] = 'Motorcycles', [9] = 'Off-road', [10] = 'Industrial',
        [11] = 'Utility', [12] = 'Vans', [13] = 'Cycles', [14] = 'Boats',
        [15] = 'Helicopters', [16] = 'Planes', [17] = 'Service',
        [18] = 'Emergency', [19] = 'Military', [20] = 'Commercial', [21] = 'Trains'
    }
    return classNames[GetVehicleClass(vehicle)] or 'Unknown'
end)

--- Check if the current vehicle belongs to a specific category
--- @param classId number|table Class number(s) to check (single or table)
--- @return boolean
exports('IsVehicleCategory', function(classId)
    if not vehicle then return false end
    local currentClass = GetVehicleClass(vehicle)
    if type(classId) == 'table' then
        for _, id in ipairs(classId) do
            if currentClass == id then return true end
        end
        return false
    end
    return currentClass == classId
end)

-- nc-hud weapon module

local lastWeaponHash = nil
local lastAmmo = -1
local lastWeaponName = nil
local lastAimingState = false

local function SendWeaponData(data)
    if not IsComponentOverridden('weaponHud') and not IsComponentOverridden('crosshair') then
        NuiMessage('weapon', data)
    end
    
    BroadcastWeapon(data)
end

local stungunConfig = Config.Stungun or {}
local stungunAmmo = stungunConfig.maxAmmo or 2
local stungunMaxAmmo = stungunConfig.maxAmmo or 2
local stungunLastFireTime = 0
local stungunRechargeTime = stungunConfig.rechargeTime or 15000

local WeaponLabels = {
    -- Pistols
    ['WEAPON_PISTOL'] = 'Pistol',
    ['WEAPON_PISTOL_MK2'] = 'Pistol MK2',
    ['WEAPON_COMBATPISTOL'] = 'Combat Pistol',
    ['WEAPON_APPISTOL'] = 'AP Pistol',
    ['WEAPON_PISTOL50'] = 'Pistol .50',
    ['WEAPON_SNSPISTOL'] = 'SNS Pistol',
    ['WEAPON_SNSPISTOL_MK2'] = 'SNS Pistol MK2',
    ['WEAPON_HEAVYPISTOL'] = 'Heavy Pistol',
    ['WEAPON_VINTAGEPISTOL'] = 'Vintage Pistol',
    ['WEAPON_FLAREGUN'] = 'Flare Gun',
    ['WEAPON_MARKSMANPISTOL'] = 'Marksman Pistol',
    ['WEAPON_REVOLVER'] = 'Revolver',
    ['WEAPON_REVOLVER_MK2'] = 'Revolver MK2',
    ['WEAPON_DOUBLEACTION'] = 'Double-Action Revolver',
    ['WEAPON_CERAMICPISTOL'] = 'Ceramic Pistol',
    ['WEAPON_NAVYREVOLVER'] = 'Navy Revolver',
    ['WEAPON_GADGETPISTOL'] = 'Perico Pistol',
    ['WEAPON_STUNGUN'] = 'Stun Gun',
    ['WEAPON_STUNGUN_MP'] = 'Stun Gun',
    ['WEAPON_PISTOLXM3'] = 'WM 29 Pistol',
    ['WEAPON_TECPISTOL'] = 'Tactical SMG',
    ['WEAPON_RAYPISTOL'] = 'Up-n-Atomizer',
    
    -- SMGs
    ['WEAPON_MICROSMG'] = 'Micro SMG',
    ['WEAPON_SMG'] = 'SMG',
    ['WEAPON_SMG_MK2'] = 'SMG MK2',
    ['WEAPON_ASSAULTSMG'] = 'Assault SMG',
    ['WEAPON_COMBATPDW'] = 'Combat PDW',
    ['WEAPON_MACHINEPISTOL'] = 'Machine Pistol',
    ['WEAPON_MINISMG'] = 'Mini SMG',
    ['WEAPON_RAYCARBINE'] = 'Unholy Hellbringer',
    
    -- Rifles
    ['WEAPON_ASSAULTRIFLE'] = 'Assault Rifle',
    ['WEAPON_ASSAULTRIFLE_MK2'] = 'Assault Rifle MK2',
    ['WEAPON_CARBINERIFLE'] = 'Carbine Rifle',
    ['WEAPON_CARBINERIFLE_MK2'] = 'Carbine Rifle MK2',
    ['WEAPON_ADVANCEDRIFLE'] = 'Advanced Rifle',
    ['WEAPON_SPECIALCARBINE'] = 'Special Carbine',
    ['WEAPON_SPECIALCARBINE_MK2'] = 'Special Carbine MK2',
    ['WEAPON_BULLPUPRIFLE'] = 'Bullpup Rifle',
    ['WEAPON_BULLPUPRIFLE_MK2'] = 'Bullpup Rifle MK2',
    ['WEAPON_COMPACTRIFLE'] = 'Compact Rifle',
    ['WEAPON_MILITARYRIFLE'] = 'Military Rifle',
    ['WEAPON_HEAVYRIFLE'] = 'Heavy Rifle',
    ['WEAPON_TACTICALRIFLE'] = 'Tactical Rifle',
    ['WEAPON_BATTLERIFLE'] = 'Battle Rifle',
    
    -- Shotguns
    ['WEAPON_PUMPSHOTGUN'] = 'Pump Shotgun',
    ['WEAPON_PUMPSHOTGUN_MK2'] = 'Pump Shotgun MK2',
    ['WEAPON_SAWNOFFSHOTGUN'] = 'Sawed-Off Shotgun',
    ['WEAPON_ASSAULTSHOTGUN'] = 'Assault Shotgun',
    ['WEAPON_BULLPUPSHOTGUN'] = 'Bullpup Shotgun',
    ['WEAPON_MUSKET'] = 'Musket',
    ['WEAPON_HEAVYSHOTGUN'] = 'Heavy Shotgun',
    ['WEAPON_DBSHOTGUN'] = 'Double Barrel Shotgun',
    ['WEAPON_AUTOSHOTGUN'] = 'Sweeper Shotgun',
    ['WEAPON_COMBATSHOTGUN'] = 'Combat Shotgun',
    
    -- Sniper Rifles
    ['WEAPON_SNIPERRIFLE'] = 'Sniper Rifle',
    ['WEAPON_HEAVYSNIPER'] = 'Heavy Sniper',
    ['WEAPON_HEAVYSNIPER_MK2'] = 'Heavy Sniper MK2',
    ['WEAPON_MARKSMANRIFLE'] = 'Marksman Rifle',
    ['WEAPON_MARKSMANRIFLE_MK2'] = 'Marksman Rifle MK2',
    ['WEAPON_PRECISIONRIFLE'] = 'Precision Rifle',
    
    -- Machine Guns
    ['WEAPON_MG'] = 'MG',
    ['WEAPON_COMBATMG'] = 'Combat MG',
    ['WEAPON_COMBATMG_MK2'] = 'Combat MG MK2',
    ['WEAPON_GUSENBERG'] = 'Gusenberg Sweeper',
    ['WEAPON_MINIGUN'] = 'Minigun',
    ['WEAPON_RAYMINIGUN'] = 'Widowmaker',
    
    -- Launchers
    ['WEAPON_RPG'] = 'RPG',
    ['WEAPON_GRENADELAUNCHER'] = 'Grenade Launcher',
    ['WEAPON_COMPACTLAUNCHER'] = 'Compact Grenade Launcher',
    ['WEAPON_HOMINGLAUNCHER'] = 'Homing Launcher',
    ['WEAPON_FIREWORK'] = 'Firework Launcher',
    ['WEAPON_SNOWLAUNCHER'] = 'Snowball Launcher',
    ['WEAPON_RAILGUN'] = 'Railgun',
    ['WEAPON_RAILGUNXM3'] = 'Railgun XM3',
    ['WEAPON_EMPLAUNCHER'] = 'EMP Launcher',
    
    -- Throwables
    ['WEAPON_GRENADE'] = 'Grenade',
    ['WEAPON_BZGAS'] = 'BZ Gas',
    ['WEAPON_SMOKEGRENADE'] = 'Smoke Grenade',
    ['WEAPON_TEARGAS'] = 'Tear Gas',
    ['WEAPON_MOLOTOV'] = 'Molotov',
    ['WEAPON_STICKYBOMB'] = 'Sticky Bomb',
    ['WEAPON_PROXMINE'] = 'Proximity Mine',
    ['WEAPON_PIPEBOMB'] = 'Pipe Bomb',
    ['WEAPON_BALL'] = 'Ball',
    ['WEAPON_SNOWBALL'] = 'Snowball',
    ['WEAPON_FLARE'] = 'Flare',
    
    -- Melee
    ['WEAPON_KNIFE'] = 'Knife',
    ['WEAPON_SWITCHBLADE'] = 'Switchblade',
    ['WEAPON_DAGGER'] = 'Dagger',
    ['WEAPON_MACHETE'] = 'Machete',
    ['WEAPON_BATTLEAXE'] = 'Battle Axe',
    ['WEAPON_HATCHET'] = 'Hatchet',
    ['WEAPON_STONE_HATCHET'] = 'Stone Hatchet',
    ['WEAPON_BAT'] = 'Baseball Bat',
    ['WEAPON_CROWBAR'] = 'Crowbar',
    ['WEAPON_GOLFCLUB'] = 'Golf Club',
    ['WEAPON_HAMMER'] = 'Hammer',
    ['WEAPON_NIGHTSTICK'] = 'Nightstick',
    ['WEAPON_WRENCH'] = 'Wrench',
    ['WEAPON_POOLCUE'] = 'Pool Cue',
    ['WEAPON_BOTTLE'] = 'Bottle',
    ['WEAPON_KNUCKLE'] = 'Knuckle Duster',
    ['WEAPON_FLASHLIGHT'] = 'Flashlight',
    ['WEAPON_CANDYCANE'] = 'Candy Cane',
    
    -- Miscellaneous
    ['WEAPON_DRILL'] = 'Drill',
    ['WEAPON_HACKINGDEVICE'] = 'Hacking Device',
    ['WEAPON_FIREEXTINGUISHER'] = 'Fire Extinguisher',
    ['WEAPON_PETROLCAN'] = 'Jerry Can',
    ['WEAPON_HAZARDCAN'] = 'Hazard Can',
    ['WEAPON_FERTILIZERCAN'] = 'Fertilizer Can',
    ['WEAPON_METALDETECTOR'] = 'Metal Detector',
    
    ['default'] = 'Weapon'
}

local function GetWeaponLabel(weaponHash)
    if not weaponHash then return nil end
    
    for name, label in pairs(WeaponLabels) do
        if GetHashKey(name) == weaponHash then
            return label
        end
    end
    
    return WeaponLabels['default']
end

local function StartWeaponThread()
    CreateThread(function()
        while PlayerLoaded do
            HideHudComponentThisFrame(2)
            DisplayAmmoThisFrame(false)
            Wait(0)
        end
    end)
    
    -- Stungun per-frame control thread
    if stungunConfig.enabled ~= false then
    CreateThread(function()
        local lastShotTime = 0
        
        while PlayerLoaded do
            local ped = cache.ped
            local weaponHash = GetSelectedPedWeapon(ped)
            
            if weaponHash == GetHashKey("WEAPON_STUNGUN") or weaponHash == GetHashKey("WEAPON_STUNGUN_MP") then
                if stungunAmmo > 0 then
                    SetAmmoInClip(ped, weaponHash, 1)
                else
                    SetAmmoInClip(ped, weaponHash, 0)
                    DisablePlayerFiring(cache.playerId, true)
                    DisableControlAction(0, 24, true)
                    DisableControlAction(0, 25, true)
                    DisableControlAction(0, 257, true)
                    DisableControlAction(0, 45, true)
                end
                
                local currentTime = GetGameTimer()
                if IsPedShooting(ped) and stungunAmmo > 0 and (currentTime - lastShotTime) > 500 then
                    stungunAmmo = stungunAmmo - 1
                    stungunLastFireTime = currentTime
                    lastShotTime = currentTime
                end
            end
            
            Wait(0)
        end
    end)
    
    -- Stungun auto-recharge thread
    CreateThread(function()
        while PlayerLoaded do
            Wait(1000)
            
            local currentTime = GetGameTimer()
            if stungunAmmo < stungunMaxAmmo then
                if currentTime - stungunLastFireTime >= stungunRechargeTime then
                    stungunAmmo = math.min(stungunAmmo + 1, stungunMaxAmmo)
                    stungunLastFireTime = currentTime
                    
                    if stungunAmmo == stungunMaxAmmo then
                        Notify('Stun Gun', 'Fully Loaded', 'success')
                    else
                        Notify('Stun Gun', stungunAmmo .. '/' .. stungunMaxAmmo .. ' Loaded', 'info')
                    end
                end
            end
        end
    end)
    end -- stungun enabled end
    
    CreateThread(function()
        local lastPauseState = false
        
        while PlayerLoaded do
            local sleep = 1000
            local ped = cache.ped
            local weaponHash = GetSelectedPedWeapon(ped)
            
            -- Death check (based on Config.DeathResource)
            local isDead = false
            local deathRes = Config.DeathResource or 'none'
            
            if deathRes == 'wasabi_ambulance' and GetResourceState('wasabi_ambulance') == 'started' then
                local ok, result = pcall(function()
                    return exports.wasabi_ambulance:isPlayerDead()
                end)
                if ok and result then isDead = true end
            elseif deathRes == 'qb-ambulancejob' and GetResourceState('qb-ambulancejob') == 'started' then
                local ok, result = pcall(function()
                    return exports['qb-ambulancejob']:isPlayerDead()
                end)
                if ok and result then isDead = true end
            elseif deathRes == 'esx_ambulancejob' then
                isDead = IsEntityDead(cache.ped)
            elseif deathRes == 'custom' and Config.IsPlayerDead then
                local ok, result = pcall(Config.IsPlayerDead)
                if ok and result then isDead = true end
            elseif deathRes == 'none' then
                isDead = IsEntityDead(cache.ped)
            end
            
            -- Hide when paused, inventory open, or dead
            local pauseMenuActive = IsPauseMenuActive()
            local inventoryActive = LocalPlayer.state.invOpen
            local shouldHide = pauseMenuActive or inventoryActive or isDead
            
            if shouldHide then
                if not lastPauseState then
                    lastPauseState = true
                    SendWeaponData({
                        show = false,
                        ammo = 0,
                        maxAmmo = 0,
                        name = nil,
                        aiming = false,
                    })
                end
                sleep = 200
            elseif weaponHash ~= GetHashKey("WEAPON_UNARMED") then
                lastPauseState = false
                sleep = 200
                
                if IsPedShooting(ped) or IsControlPressed(0, 24) then
                    sleep = 50
                end

                local currentAmmo, maxAmmo
                
                if weaponHash == GetHashKey("WEAPON_STUNGUN") or weaponHash == GetHashKey("WEAPON_STUNGUN_MP") then
                    currentAmmo = stungunAmmo
                    maxAmmo = stungunMaxAmmo
                else
                    local _, clipAmmo = GetAmmoInClip(ped, weaponHash)
                    local maxClipAmmo = GetMaxAmmoInClip(ped, weaponHash, true)
                    currentAmmo = clipAmmo or 0
                    maxAmmo = maxClipAmmo or 30
                end
                
                local weaponName = GetWeaponLabel(weaponHash)
                local isAiming = IsPlayerFreeAiming(cache.playerId)
                
                if lastWeaponHash ~= weaponHash or lastAmmo ~= currentAmmo or lastWeaponName ~= weaponName or lastAimingState ~= isAiming then
                    lastWeaponHash = weaponHash
                    lastAmmo = currentAmmo
                    lastWeaponName = weaponName
                    lastAimingState = isAiming
                    
                    SendWeaponData({
                        show = true,
                        ammo = currentAmmo,
                        maxAmmo = maxAmmo,
                        name = weaponName,
                        aiming = isAiming,
                    })
                end
            else
                lastPauseState = false
                if lastWeaponHash then
                    lastWeaponHash = nil
                    lastAmmo = -1
                    lastWeaponName = nil
                    lastAimingState = false
                    
                    SendWeaponData({
                        show = false,
                        ammo = 0,
                        maxAmmo = 0,
                        name = nil,
                        aiming = false,
                    })
                end
            end
            
            Wait(sleep)
        end
    end)
end

CreateThread(function()
    while not HudLoaded do
        Wait(100)
    end
    
    while not PlayerLoaded do
        Wait(100)
    end
    
    StartWeaponThread()
end)

RegisterCommand('weaponhud', function()
    SendWeaponData({
        show = true,
        ammo = 15,
        maxAmmo = 30,
        name = 'Test Weapon',
        aiming = false,
    })
end, false)


---@param title string
---@param description string
---@param type string
Notify = function (title, description, type)
    local notifyType = Config.NotifyResource or 'ox_lib'
    
    if notifyType == 'ox_lib' then
        lib.notify({
            title = title,
            description = description,
            type = type
        })
    elseif notifyType == 'qb' then
        TriggerEvent('QBCore:Notify', description, type)
    elseif notifyType == 'esx' then
        TriggerEvent('esx:showNotification', description)
    elseif notifyType == 'custom' then
        if Config.CustomNotify then
            Config.CustomNotify(title, description, type)
        end
    else
        -- Fallback: ox_lib
        lib.notify({
            title = title,
            description = description,
            type = type
        })
    end
end

---@param action string
---@param data any
NuiMessage = function(action, data)
    SendNUIMessage({
        action = action,
        data = data,
    })
end



export async function nuicallback(eventName, data) {
    const options = {
      method: "post",
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(data)
    }
  
    const resourceName = window.GetParentResourceName
      ? window.GetParentResourceName()
      : "nui-frame-app"
  
    try {
      const resp = await fetch(`https://${resourceName}/${eventName}`, options)
      const text = await resp.text()
      if (!text || text.trim() === '') {
        return {}
      }
      return JSON.parse(text)
    } catch (e) {
      // Ignore in dev environment or when no response
      return {}
    }
}

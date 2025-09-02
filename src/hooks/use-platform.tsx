import * as React from "react"

export interface PlatformInfo {
  isAndroid: boolean
  isIOS: boolean
  isDesktop: boolean
}

export function usePlatform(): PlatformInfo {
  const [platform, setPlatform] = React.useState<PlatformInfo>({
    isAndroid: false,
    isIOS: false,
    isDesktop: true
  })

  React.useEffect(() => {
    const detectPlatform = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      
      const isAndroid = userAgent.includes('android')
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const isDesktop = !isAndroid && !isIOS
      
      setPlatform({
        isAndroid,
        isIOS,
        isDesktop
      })
    }

    detectPlatform()
    
    // No need to listen for changes as platform detection doesn't change during session
  }, [])

  return platform
}
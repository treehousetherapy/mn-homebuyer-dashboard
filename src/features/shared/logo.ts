const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
export const logoImg = faviconLink?.href ?? './logo.png'

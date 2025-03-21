export function trim_url(url) {
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      
      if (pathParts.length >= 2) {
        return `${pathParts[0]}/${pathParts[1]}`;
      }
  
      throw new Error("Invalid GitHub URL");
    } catch {
      return null;
    }
  }
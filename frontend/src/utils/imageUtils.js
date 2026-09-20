/**
 * Helper to resolve absolute URL for image resources (Base64, external URL, or relative /uploads path)
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') {
    url = url.url || url.src || '';
  }
  if (!url) return '';

  const cleanUrl = url.trim();

  // Return base64 or absolute http/https URLs directly
  if (cleanUrl.startsWith('data:image/') || cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // Handle relative server upload paths (e.g. /uploads/rooms/img.png)
  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const defaultBackend = isLocal 
    ? 'http://localhost:5000' 
    : 'https://hotel-management-system-backend-slt.vercel.app';

  const backendBase = import.meta.env.VITE_SERVER_URL 
    ? import.meta.env.VITE_SERVER_URL.replace(/\/api\/?$/, '') 
    : defaultBackend;

  const pathWithSlash = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  return `${backendBase}${pathWithSlash}`;
};

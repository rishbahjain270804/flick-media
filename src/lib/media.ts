/**
 * Media and communication utilities for creative productions
 */

export type MediaProvider = 'spotify' | 'youtube' | 'vimeo' | 'soundcloud' | 'generic';

export function getMediaProvider(url: string): MediaProvider {
  if (!url) return 'generic';
  const lower = url.toLowerCase();
  if (lower.includes('spotify.com')) return 'spotify';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('vimeo.com')) return 'vimeo';
  if (lower.includes('soundcloud.com')) return 'soundcloud';
  return 'generic';
}

export function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Spotify (Track, Album, Playlist, Artist)
  // e.g. https://open.spotify.com/track/2WcH0fdH0QTvBNUsiRlh4Q?si=...
  const spotifyMatch = trimmed.match(/open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    const type = spotifyMatch[1];
    const id = spotifyMatch[2];
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  // YouTube
  // e.g. https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
  }

  // Vimeo
  // e.g. https://vimeo.com/123456789
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
  }

  return null;
}

export function generateWhatsAppMessage(
  applicantName: string,
  role: string,
  dates: string = '24-29 Oct'
): string {
  const greeting = applicantName ? `Hi ${applicantName.split(' ')[0]}!` : 'Hi!';
  const message = `${greeting} This is the team at Flick Media reaching out regarding your submission for ${role || 'our upcoming project'} (shoot dates: ${dates}). We reviewed your portfolio and would love to connect for a quick 5-min alignment call. Are you free today?`;
  return encodeURIComponent(message);
}

export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  // Default to Indian country code +91 if 10 digits provided
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

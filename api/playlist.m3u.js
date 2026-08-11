export default async function handler(req, res) {
  try {
    // Fetch the JSON data
    const response = await fetch('https://sonujson-devloper.vercel.app/Data/sports.json');
    const data = await response.json();
    const channels = data.channels || [];

    // Build M3U playlist
    let m3u = '#EXTM3U\n';
    m3u += '#PLAYLIST: Sports Channels\n';
    m3u += '#SOURCE: https://sonujson-devloper.vercel.app/Data/sports.json\n';
    m3u += '#UPDATED: ' + (data.last_updated || 'Unknown') + '\n\n';

    channels.forEach(ch => {
      const name = ch.name || 'Unknown';
      const id = ch.id || '';
      let url = (ch.stream_url || '').replace(/\/\//g, '/').replace(':/', '://');
      
      // Add cookie to URL for direct play
      if (ch.cookie) {
        const rawCookie = ch.cookie.startsWith('__hdnea__=') ? ch.cookie.slice(10) : ch.cookie;
        if (rawCookie && !url.includes('__hdnea__')) {
          const sep = url.includes('?') ? '&' : '?';
          url += sep + '__hdnea__=' + rawCookie;
        }
      }

      // Build EXTINF with all metadata
      const attrs = [
        `tvg-id="${id}"`,
        `tvg-name="${name}"`,
        `group-title="Sports"`,
        `tvg-type="DASH"`,
      ];
      
      if (ch.key_id && ch.key) {
        attrs.push(`tvg-drm="ClearKey"`);
        attrs.push(`tvg-keyid="${ch.key_id}"`);
        attrs.push(`tvg-key="${ch.key}"`);
      }
      
      if (ch.cookie_expire) {
        attrs.push(`tvg-cookie-expire="${ch.cookie_expire}"`);
      }

      m3u += `#EXTINF:-1 ${attrs.join(' ')},${name}\n`;
      m3u += `${url}\n\n`;
    });

    // Set headers
    res.setHeader('Content-Type', 'audio/x-mpegurl');
    res.setHeader('Content-Disposition', 'inline; filename="sports.m3u"');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'max-age=300, public');
    
    res.status(200).send(m3u);
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate playlist' });
  }
}

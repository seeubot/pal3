export default async function handler(req, res) {
  try {
    const response = await fetch('https://sonujson-devloper.vercel.app/Data/sports.json');
    const data = await response.json();
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'max-age=60');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
}

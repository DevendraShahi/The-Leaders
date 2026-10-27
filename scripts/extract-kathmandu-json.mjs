async function extractKathmanduJson() {
  const res = await fetch('https://nplt20league.com/teams/kathmandu-gurkhas', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  
  // match "players":[{...}]
  const match = html.match(/"players":(\[\{"slug"[^\]]+\])/);
  if (match) {
    const raw = match[1].replace(/\\"/g, '"');
    try {
      const players = JSON.parse(raw);
      console.log(`Successfully parsed ${players.length} players!`);
      for (const p of players) {
        console.log(JSON.stringify(p, null, 2));
      }
    } catch (e) {
      console.log('JSON parse error:', e.message);
      console.log('Sample:', raw.substring(0, 300));
    }
  } else {
    console.log('Regex did not match players array');
  }
}
extractKathmanduJson();

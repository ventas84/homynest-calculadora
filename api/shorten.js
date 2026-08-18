export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url" });
  try {
    const resp = await fetch(
      `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`
    );
    const short = await resp.text();
    if (short.startsWith("https://is.gd/")) return res.json({ short });
    res.status(502).json({ error: "Invalid response" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

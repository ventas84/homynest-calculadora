export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url" });
  try {
    const resp = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
    );
    const short = await resp.text();
    if (short.startsWith("http")) return res.json({ short });
    res.status(502).json({ error: "Invalid response" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

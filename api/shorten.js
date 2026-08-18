export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url" });
  try {
    const resp = await fetch("https://cleanuri.com/api/v1/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `url=${encodeURIComponent(url)}`,
    });
    const data = await resp.json();
    if (data.result_url) return res.json({ short: data.result_url });
    res.status(502).json({ error: data.error || "Shortener failed" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

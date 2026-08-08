const PREFIX = "quote:";

export const storage = {
  save(quote) {
    try {
      localStorage.setItem(PREFIX + quote.id, JSON.stringify(quote));
      return true;
    } catch (e) {
      console.error("storage.save:", e);
      return false;
    }
  },

  get(id) {
    try {
      const raw = localStorage.getItem(PREFIX + id);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  list() {
    try {
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(PREFIX)) {
          try {
            items.push(JSON.parse(localStorage.getItem(key)));
          } catch {}
        }
      }
      return items.sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  },

  del(id) {
    try {
      localStorage.removeItem(PREFIX + id);
      return true;
    } catch {
      return false;
    }
  },
};

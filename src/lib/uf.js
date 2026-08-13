import { useState, useEffect } from "react";
import { C } from "../data/constants";

let cachedUf = null;

export async function fetchUf() {
  if (cachedUf) return cachedUf;
  try {
    const res = await fetch("https://mindicador.cl/api/uf");
    const data = await res.json();
    if (data.serie && data.serie.length > 0) {
      cachedUf = Math.round(data.serie[0].valor);
      return cachedUf;
    }
  } catch {}
  return C.uf;
}

export function useUf() {
  const [uf, setUf] = useState(C.uf);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchUf().then((v) => {
      setUf(v);
      setLoaded(true);
    });
  }, []);

  return { uf, loaded };
}

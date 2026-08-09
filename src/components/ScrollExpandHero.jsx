import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { P, font } from "../data/constants";

const GALLERY = {
  m36: "/fotos/m36-exterior.png",
  m54: "/fotos/m54-exterior.png",
  m22: "/fotos/m22-exterior.png",
  m50: "/fotos/m50-exterior.png",
};

export default function ScrollExpandHero({ quote, onExpanded }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  const modelKey = quote.presetId || (quote.mt2 <= 25 ? "m22" : quote.mt2 <= 40 ? "m36" : quote.mt2 <= 52 ? "m50" : "m54");
  const imageSrc = GALLERY[modelKey] || GALLERY.m36;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (expanded) return;

    const handleWheel = (e) => {
      if (expanded) return;
      e.preventDefault();
      const delta = e.deltaY * 0.0012;
      const next = Math.min(Math.max(scrollProgress + delta, 0), 1);
      setScrollProgress(next);
      if (next >= 1) {
        setExpanded(true);
        if (onExpanded) onExpanded();
      }
    };

    const handleTouchStart = (e) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
      if (expanded || !touchStartY) return;
      e.preventDefault();
      const deltaY = touchStartY - e.touches[0].clientY;
      const factor = deltaY < 0 ? 0.008 : 0.005;
      const next = Math.min(Math.max(scrollProgress + deltaY * factor, 0), 1);
      setScrollProgress(next);
      if (next >= 1) {
        setExpanded(true);
        if (onExpanded) onExpanded();
      }
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchEnd = () => setTouchStartY(0);

    const handleScroll = () => {
      if (!expanded) window.scrollTo(0, 0);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollProgress, expanded, touchStartY, onExpanded]);

  const mediaW = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const mediaH = 300 + scrollProgress * (isMobile ? 250 : 500);
  const textX = scrollProgress * (isMobile ? 180 : 150);
  const overlayOpacity = 0.5 - scrollProgress * 0.35;

  const title = quote.modelName || `${quote.mt2} m²`;
  const words = title.split(" ");
  const firstWord = words[0];
  const rest = words.slice(1).join(" ");

  if (expanded) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: font,
        transition: "opacity .4s ease",
      }}
    >
      {/* Background image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 - scrollProgress }}
        transition={{ duration: 0.1 }}
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      >
        <img
          src={imageSrc}
          alt="Background"
          style={{
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            objectPosition: "center",
            filter: "blur(20px) brightness(0.7)",
            transform: "scale(1.1)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }} />
      </motion.div>

      {/* Expanding media card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `${mediaW}px`,
          height: `${mediaH}px`,
          maxWidth: "95vw",
          maxHeight: "85vh",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(0,0,0,0.35)",
          zIndex: 1,
        }}
      >
        <img
          src={imageSrc}
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <motion.div
          animate={{ opacity: overlayOpacity }}
          transition={{ duration: 0.15 }}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            borderRadius: 16,
          }}
        />
      </div>

      {/* Title text */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        <motion.h2
          style={{
            fontSize: isMobile ? 32 : 48,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            transform: `translateX(-${textX}vw)`,
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          {firstWord}
        </motion.h2>
        <motion.h2
          style={{
            fontSize: isMobile ? 32 : 48,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            transform: `translateX(${textX}vw)`,
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          {rest}
        </motion.h2>
      </div>

      {/* Scroll hint */}
      <motion.div
        animate={{ opacity: 1 - scrollProgress * 3 }}
        style={{
          position: "absolute",
          bottom: 40,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500 }}>
          Desliza para ver el presupuesto
        </div>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          style={{ color: "rgba(255,255,255,0.6)", fontSize: 20 }}
        >
          &#8595;
        </motion.div>
      </motion.div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(255,255,255,0.15)",
          zIndex: 3,
        }}
      >
        <motion.div
          style={{
            height: "100%",
            background: P.accent,
            width: `${scrollProgress * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

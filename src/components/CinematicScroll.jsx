import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { B, font, fontHeading } from "../data/constants";
import { HomyNestLogo } from "./ui";

const CHAPTER_POSTERS = {
  m36: ["/fotos/m36-exterior.png", "/fotos/m54-exterior.png", "/fotos/m54-terraza.png"],
  m54: ["/fotos/m54-exterior.png", "/fotos/m54-nocturno.png", "/fotos/m54-terraza.png"],
  m22: ["/fotos/m22-exterior.png", "/fotos/m54-exterior.png", "/fotos/m54-terraza.png"],
  m50: ["/fotos/m50-exterior.png", "/fotos/m54-exterior.png", "/fotos/m54-terraza.png"],
};

function getChapters(quote) {
  const modelKey = quote.presetId ||
    (quote.mt2 <= 25 ? "m22" : quote.mt2 <= 40 ? "m36" : quote.mt2 <= 52 ? "m50" : "m54");
  const posters = CHAPTER_POSTERS[modelKey] || CHAPTER_POSTERS.m36;

  return [
    {
      id: "01",
      title: quote.modelName || `${quote.mt2} m²`,
      subtitle: "Diseño a tu medida",
      videoUrl: "/videos/chapter1.mp4",
      poster: posters[0],
      description: `Casa modular de ${quote.mt2} metros cuadrados, diseñada para adaptarse a tu terreno y estilo de vida.`,
    },
    {
      id: "02",
      title: "Construcción",
      subtitle: "Calidad garantizada",
      videoUrl: "/videos/chapter2.mp4",
      poster: posters[1],
      description: "Fabricación en taller con materiales de primera calidad. Control total del proceso constructivo.",
    },
    {
      id: "03",
      title: "Entrega",
      subtitle: "Llave en mano",
      videoUrl: "/videos/chapter3.mp4",
      poster: posters[2],
      description: "Tu casa lista para habitar. Instalación completa en terreno, con fundaciones y terminaciones.",
    },
  ];
}

const textContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const textReveal = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: "0%", opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.4, ease: "easeOut" } },
};

function FilmGrain() {
  return (
    <div style={{ pointerEvents: "none", position: "absolute", inset: 0, zIndex: 20, opacity: 0.07, mixBlendMode: "overlay" }}>
      <div style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }} />
    </div>
  );
}

function MediaSlide({ chapter, isActive }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const base = { position: "absolute", inset: 0, width: "100%", height: "100%" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 10 : 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      style={base}
    >
      {!videoFailed ? (
        <video
          src={chapter.videoUrl}
          poster={chapter.poster}
          autoPlay muted loop playsInline
          onError={() => setVideoFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <motion.img
          src={chapter.poster}
          alt={chapter.title}
          animate={{ scale: [1, 1.06] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
    </motion.div>
  );
}

function VideoBackground({ chapters, currentIndex }) {
  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden", background: "#000" }}>
      {chapters.map((ch, i) => (
        <MediaSlide key={ch.id} chapter={ch} isActive={i === currentIndex} />
      ))}
      <FilmGrain />
    </div>
  );
}

function DynamicNav({ chapters, activeIndex, progress, visible }) {
  const smoothProgress = useSpring(progress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: visible ? 0 : 100, opacity: visible ? 1 : 0 }}
      transition={{ delay: visible ? 0.5 : 0, duration: 0.4 }}
      style={{
        position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 50,
        display: "flex", alignItems: "center", gap: 16, borderRadius: 9999,
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)", padding: "8px 8px 8px 24px",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", fontFamily: font,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>
          {chapters[activeIndex].id} / {String(chapters.length).padStart(2, "0")}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ fontSize: 12, fontWeight: 700, color: "#fff", minWidth: 100, whiteSpace: "nowrap" }}
          >
            {chapters[activeIndex].title}
          </motion.span>
        </AnimatePresence>
      </div>

      <div style={{ position: "relative", height: 48, width: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
          <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
          <motion.circle
            cx="24" cy="24" r="18" stroke={B.green} strokeWidth="2" fill="none"
            strokeDasharray="113" style={{ pathLength: smoothProgress }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="none">
            <polygon points="6,3 20,12 6,21" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export default function CinematicScroll({ quote }) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(null);
  const [navVisible, setNavVisible] = useState(true);

  const chapters = getChapters(quote);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setActiveIndex(Math.min(Math.floor(latest * chapters.length), chapters.length - 1));
      setNavVisible(latest < 0.95);
    });
    return () => unsubscribe();
  }, [scrollYProgress, chapters.length]);

  const scrollNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="no-print"
      style={{ position: "relative", width: "100%", height: `${chapters.length * 100}vh` }}
    >
      {/* Sticky video background */}
      <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", overflow: "hidden" }}>
        <VideoBackground chapters={chapters} currentIndex={activeIndex} />
        {/* Brand overlay */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute", top: isMobile ? 20 : 32, left: isMobile ? 24 : 96,
            zIndex: 40, display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <HomyNestLogo color="#fff" size={isMobile ? 30 : 38} />
          <span style={{ color: "#fff", fontSize: isMobile ? 18 : 24, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: font, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
            HomyNest
          </span>
        </motion.div>
      </div>

      {/* Bottom nav */}
      <DynamicNav chapters={chapters} activeIndex={activeIndex} progress={scrollYProgress} visible={navVisible} />

      {/* Chapter content overlay */}
      <div style={{ position: "absolute", inset: 0, zIndex: 30, pointerEvents: "none" }}>
        {chapters.map((chapter, i) => (
          <div
            key={chapter.id}
            style={{
              display: "flex", height: "100vh", width: "100%",
              alignItems: "center", justifyContent: "flex-start",
              padding: isMobile ? "0 24px" : "0 96px",
            }}
          >
            <motion.div
              variants={textContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-20%" }}
              style={{ maxWidth: 896, pointerEvents: "auto", fontFamily: font }}
            >
              {/* Chapter indicator */}
              <motion.div variants={fadeIn} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ height: 2, width: 48, background: B.green }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: B.green }}>
                  {chapter.id}
                </span>
              </motion.div>

              {/* Big title */}
              <div style={{ overflow: "hidden", marginBottom: 24, paddingTop: 8, paddingBottom: 8 }}>
                <motion.h2
                  variants={textReveal}
                  style={{
                    fontSize: isMobile ? 36 : 72, fontWeight: 900, color: "#fff",
                    letterSpacing: "-0.04em", lineHeight: 1, margin: 0, fontFamily: fontHeading,
                  }}
                >
                  {chapter.subtitle}
                </motion.h2>
              </div>

              {/* Description card */}
              <motion.div
                variants={fadeIn}
                style={{
                  maxWidth: 448, padding: 24, borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                }}
              >
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
                  {chapter.description}
                </p>
              </motion.div>

              {/* CTA button */}
              <motion.button
                variants={fadeIn}
                onClick={scrollNext}
                onMouseEnter={() => setHoverBtn(i)}
                onMouseLeave={() => setHoverBtn(null)}
                style={{
                  marginTop: 40, display: "flex", alignItems: "center", gap: 16,
                  color: "#fff", fontWeight: 600, background: "none", border: "none",
                  cursor: "pointer", fontFamily: font, padding: 0,
                }}
              >
                <div style={{
                  position: "relative", height: 48, width: 48, borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", inset: 0, background: "#fff",
                    transform: hoverBtn === i ? "translateY(0)" : "translateY(100%)",
                    transition: "transform 0.3s ease",
                  }} />
                  <svg
                    width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke={hoverBtn === i ? "#000" : "#fff"} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: "relative", zIndex: 1, transition: "stroke 0.3s ease" }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <span style={{ letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 12 }}>
                  {i === chapters.length - 1 ? "Ver Presupuesto" : "Siguiente"}
                </span>
              </motion.button>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

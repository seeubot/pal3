export const API_URL = "https://sonujson-devloper.vercel.app/Data/sports.json";

export const getTierConfig = () => {
  const mem = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const net = conn ? (conn.effectiveType || "4g") : "4g";
  
  if (!mobile) return "high";
  if (mem <= 1.5 || cores <= 2 || net === "slow-2g" || net === "2g") return "low";
  if (mem <= 3 || cores <= 4) return "mid";
  return "high";
};

const TIER = getTierConfig();

export const PLAYER_CONFIG = {
  low: { buf: 5, reBuf: 1.5, behind: 15, maxH: 480, maxBw: 1200000, bwEst: 400000 },
  mid: { buf: 8, reBuf: 1.5, behind: 25, maxH: 720, maxBw: 3500000, bwEst: 1000000 },
  high: { buf: 12, reBuf: 1.5, behind: 30, maxH: 1080, maxBw: 0, bwEst: 2000000 }
}[TIER];

export const FIT_MODES = ['contain', 'fill', 'cover'];

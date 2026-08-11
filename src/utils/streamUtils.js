export const rawCookie = (c) => {
  return c && c.startsWith("__hdnea__=") ? c.slice(10) : (c || "");
};

export const withCookie = (u, r) => {
  if (!u || !r) return u;
  if (u.indexOf("__hdnea__") !== -1) return u;
  return u + (u.indexOf("?") !== -1 ? "&" : "?") + "__hdnea__=" + r;
};

export const formatError = (error) => {
  if (!error) return "Unknown error";
  const categories = {
    1: "Network", 2: "Text", 3: "Media", 4: "Manifest",
    5: "Streaming", 6: "DRM", 7: "Player"
  };
  let msg = `${categories[error.category] || "Error"} ${error.category}:${error.code}`;
  if (error.data?.[0] && typeof error.data[0] === "string") {
    msg += ` — ${error.data[0].slice(0, 72)}`;
  }
  return msg;
};

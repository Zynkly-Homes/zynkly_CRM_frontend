export const maskMobile = (mobile?: string | null): string => {
  if (!mobile) return "-";
  return `XXXXXXX${mobile.slice(-3)}`;
};

export const maskPan = (pan?: string | null): string => {
  if (!pan) return "-";
  return `xxxxx${pan.slice(-4)}`;
};

export const maskAadhaar = (aadhaar?: string | null): string => {
  if (!aadhaar) return "-";
  return `xxxx xxxx ${aadhaar.slice(-4)}`;
};

export const maskEmail = (email?: string | null): string => {
  if (!email) return "-";

  const [username, domain] = email.split("@");
  if (!username || !domain) return "-";

  // agar username chhota ho
  if (username.length <= 2) {
    return `${username[0] || "x"}x@${domain}`;
  }

  const visible = username.slice(0, 2);
  const masked = "x".repeat(Math.max(username.length - 2, 3));

  return `${visible}${masked}@${domain}`;
};

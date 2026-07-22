export function getDeviceId(): string {
  if (typeof window === "undefined") return "";

  const existing = localStorage.getItem("device_id");
  if (existing) return existing;

  const newId = crypto.randomUUID();
  localStorage.setItem("device_id", newId);
  return newId;
}
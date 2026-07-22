export async function getLocationFromIp(ip) {
  try {
    // Handle localhost/private IPs during local testing
    if (!ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("::ffff:127.")) {
      return { city: "Unknown", state: "Unknown" };
    }

    const cleanIp = ip.replace("::ffff:", "");
    const response = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,city,regionName`);
    const data = await response.json();

    if (data.status !== "success") {
      return { city: "Unknown", state: "Unknown" };
    }

    return {
      city: data.city || "Unknown",
      state: data.regionName || "Unknown",
    };
  } catch (error) {
    console.error("Geolocation lookup failed:", error);
    return { city: "Unknown", state: "Unknown" };
  }
}
/**
 * Helper utility to fetch the configured WhatsApp phone number or WhatsApp group URL.
 * Defaults to the placeholder number if not provided in env.
 */
export function getWhatsappNumber(): string {
  const envNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  if (envNumber && envNumber.trim() !== "") {
    // Strip out all non-numeric characters (spaces, +, -, brackets)
    return envNumber.replace(/\D/g, "");
  }
  // Default placeholder number (can be replaced by user in the Settings tab)
  return "919999999999";
}

/**
 * Checks if the configured WhatsApp number is the default placeholder number.
 */
export function isPlaceholderNumber(): boolean {
  return getWhatsappNumber() === "919999999999";
}

/**
 * Returns the WhatsApp group URL or direct chat URL with reservation message.
 */
export function getWhatsappGroupUrl(name?: string, phone?: string, email?: string): string {
  const customGroupUrl = import.meta.env.VITE_WHATSAPP_GROUP_URL;
  if (customGroupUrl && customGroupUrl.trim() !== "") {
    return customGroupUrl.trim();
  }

  const number = getWhatsappNumber();
  if (name && phone && email) {
    const msg = `Hi CodeInIndia! I want to reserve my seat for the upcoming batch.\n\nFull Name: ${name}\nMobile Number: ${phone}\nEmail ID: ${email}`;
    return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent("Hi CodeInIndia! I want to join the official WhatsApp group and reserve my seat.")}`;
}

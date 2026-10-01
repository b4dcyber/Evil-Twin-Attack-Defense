// Cryptographic and network forensic helpers for B4DCyber Framework

export function generateNonce(length = 32): string {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function formatMac(mac: string): string {
  return mac.toUpperCase();
}

export function isMacRandomized(mac: string): boolean {
  // Checks if the 2nd hex digit has the locally administered bit set (2, 6, A, E)
  const cleaned = mac.replace(/[:-]/g, '');
  if (cleaned.length < 2) return false;
  const secondChar = cleaned[1].toUpperCase();
  return ['2', '6', 'A', 'E'].includes(secondChar);
}

export function lookupVendor(mac: string): string {
  const prefix = mac.toUpperCase().slice(0, 8);
  const ouiTable: Record<string, string> = {
    'E4:5F:01': 'Raspberry Pi Foundation / OpenWrt AP',
    '74:DA:38': 'TP-Link Corporation',
    'F8:1A:67': 'Ubiquiti Networks Inc.',
    'B8:27:EB': 'Raspberry Pi Trading',
    'AC:BC:32': 'Apple Inc.',
    '50:C7:BF': 'TP-Link Technologies',
    '00:14:22': 'Dell Computer Corp',
    '00:C0:CA': 'Alfa Network (Attacker Wi-Fi Card / Kali)',
    'DE:AD:BE': 'Unknown / Spoofed Attacker Rig',
    '02:1A:11': 'Virtual Hotspot / Android Cloner',
    'F0:99:BF': 'Apple iPhone 15 Pro',
    '38:F9:D3': 'Samsung Electronics',
    'FC:FB:FB': 'Intel Corporate (Laptop Client)',
    '1C:69:7A': 'OnePlus Technology'
  };
  return ouiTable[prefix] || (isMacRandomized(mac) ? 'Randomized Private MAC' : 'Generic IEEE Device');
}

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Generate realistic Ed25519 signature hex based on router private key and nonce
export async function simulateEd25519Sign(nonce: string, privateKeySecret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(nonce + privateKeySecret + ':B4DCYBER_AUTH_PAYLOAD');
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'ed25519_sig_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

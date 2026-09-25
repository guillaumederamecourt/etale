const WMO = {
  0: ['clear', 'Ciel clair'],
  1: ['mostly', 'Peu nuageux'],
  2: ['partly', 'Partiellement nuageux'],
  3: ['cloudy', 'Couvert'],
  45: ['fog', 'Brouillard'],
  48: ['fog', 'Brouillard givrant'],
  51: ['drizzle', 'Bruine légère'],
  53: ['drizzle', 'Bruine'],
  55: ['drizzle', 'Bruine dense'],
  56: ['drizzle', 'Bruine verglaçante'],
  57: ['drizzle', 'Bruine verglaçante'],
  61: ['rain', 'Pluie faible'],
  63: ['rain', 'Pluie'],
  65: ['rain', 'Pluie forte'],
  66: ['rain', 'Pluie verglaçante'],
  67: ['rain', 'Pluie verglaçante'],
  71: ['snow', 'Neige faible'],
  73: ['snow', 'Neige'],
  75: ['snow', 'Neige forte'],
  77: ['snow', 'Grains de neige'],
  80: ['showers', 'Averses'],
  81: ['showers', 'Averses'],
  82: ['showers', 'Averses violentes'],
  85: ['snow', 'Averses de neige'],
  86: ['snow', 'Averses de neige'],
  95: ['storm', 'Orage'],
  96: ['storm', 'Orage avec grêle'],
  99: ['storm', 'Orage avec grêle'],
};

/** @returns {{kind: string, label: string}} */
export function weather(code) {
  const [kind, label] = WMO[code] || ['cloudy', 'Nuageux'];
  return { kind, label };
}

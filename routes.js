// Lista de capitais dos estados brasileiros
window.CAPITAIS = [
  "Rio Branco", "Maceió", "Macapá", "Manaus", "Salvador", "Fortaleza", "Vitória", "Goiânia", "São Luís", "Cuiabá", "Campo Grande", "Belo Horizonte", "Belém", "João Pessoa", "Curitiba", "Recife", "Teresina", "Rio de Janeiro", "Natal", "Porto Alegre", "Porto Velho", "Boa Vista", "Florianópolis", "São Paulo", "Aracaju", "Palmas", "Brasília"
];

// Lista de rotas manuais (sobrescrevem estimativas automáticas quando presentes)
const MANUAL_ROUTES = [
  { origin: "São Paulo", destination: "Rio de Janeiro", distance: 429 },
  { origin: "São Paulo", destination: "Belo Horizonte", distance: 586 },
  { origin: "São Paulo", destination: "Curitiba", distance: 408 },
  { origin: "São Paulo", destination: "Porto Alegre", distance: 1130 },
  { origin: "São Paulo", destination: "Brasília", distance: 1015 },

  { origin: "Rio de Janeiro", destination: "Belo Horizonte", distance: 434 },
  { origin: "Rio de Janeiro", destination: "Vitória", distance: 521 },

  { origin: "Belo Horizonte", destination: "Vitória", distance: 526 },
  { origin: "Belo Horizonte", destination: "Brasília", distance: 740 },

  { origin: "Fortaleza", destination: "Natal", distance: 529 },
  { origin: "Recife", destination: "João Pessoa", distance: 125 },
  { origin: "Recife", destination: "Maceió", distance: 250 },
  { origin: "Salvador", destination: "Recife", distance: 803 },
  { origin: "Salvador", destination: "Vitória", distance: 1030 },

  { origin: "Manaus", destination: "Belém", distance: 919 },
  { origin: "Manaus", destination: "Boa Vista", distance: 740 },
  { origin: "Porto Velho", destination: "Manaus", distance: 789 },
  { origin: "Rio Branco", destination: "Porto Velho", distance: 1100 },
  { origin: "Rio Branco", destination: "Manaus", distance: 1305 },

  { origin: "Cuiabá", destination: "Campo Grande", distance: 824 },
  { origin: "Campo Grande", destination: "São Paulo", distance: 1041 },

  { origin: "Goiânia", destination: "Brasília", distance: 207 },

  { origin: "Curitiba", destination: "Florianópolis", distance: 305 },
  { origin: "Porto Alegre", destination: "Florianópolis", distance: 705 },

  { origin: "Aracaju", destination: "Maceió", distance: 260 },
  { origin: "Teresina", destination: "Fortaleza", distance: 520 },
  { origin: "São Luís", destination: "Teresina", distance: 480 },

  { origin: "Palmas", destination: "Brasília", distance: 760 },
  { origin: "João Pessoa", destination: "Natal", distance: 190 },
  { origin: "Belém", destination: "Macapá", distance: 334 },

  { origin: "Recife", destination: "Natal", distance: 286 },
  { origin: "Maceió", destination: "Aracaju", distance: 140 }
];

// Coordenadas (lat, lon) aproximadas das capitais (graus decimais)
const COORDS = {
  "Rio Branco": { lat: -9.97499, lon: -67.8243 },
  "Maceió": { lat: -9.66599, lon: -35.7350 },
  "Macapá": { lat: 0.0355, lon: -51.0705 },
  "Manaus": { lat: -3.1190, lon: -60.0217 },
  "Salvador": { lat: -12.9777, lon: -38.5016 },
  "Fortaleza": { lat: -3.71722, lon: -38.5434 },
  "Vitória": { lat: -20.3155, lon: -40.3128 },
  "Goiânia": { lat: -16.6869, lon: -49.2648 },
  "São Luís": { lat: -2.5307, lon: -44.3068 },
  "Cuiabá": { lat: -15.6010, lon: -56.0979 },
  "Campo Grande": { lat: -20.4697, lon: -54.6201 },
  "Belo Horizonte": { lat: -19.9191, lon: -43.9386 },
  "Belém": { lat: -1.4550, lon: -48.5024 },
  "João Pessoa": { lat: -7.1195, lon: -34.8450 },
  "Curitiba": { lat: -25.4284, lon: -49.2733 },
  "Recife": { lat: -8.0476, lon: -34.8770 },
  "Teresina": { lat: -5.0919, lon: -42.8034 },
  "Rio de Janeiro": { lat: -22.9068, lon: -43.1729 },
  "Natal": { lat: -5.7793, lon: -35.2009 },
  "Porto Alegre": { lat: -30.0331, lon: -51.2302 },
  "Porto Velho": { lat: -8.7608, lon: -63.8999 },
  "Boa Vista": { lat: 2.8195, lon: -60.6730 },
  "Florianópolis": { lat: -27.5969, lon: -48.5495 },
  "São Paulo": { lat: -23.5505, lon: -46.6333 },
  "Aracaju": { lat: -10.9472, lon: -37.0731 },
  "Palmas": { lat: -10.1757, lon: -48.3276 },
  "Brasília": { lat: -15.8267, lon: -47.9218 }
};

// função Haversine para distância entre coordenadas (km)
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371; // raio médio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// gera todas as combinações únicas entre capitais, usando rotas manuais quando disponíveis
const routeMap = new Map();
const keyOf = (a,b) => (a < b) ? `${a}|${b}` : `${b}|${a}`;
MANUAL_ROUTES.forEach(r => routeMap.set(keyOf(r.origin, r.destination), r.distance));
for (let i = 0; i < window.CAPITAIS.length; i++) {
  for (let j = i + 1; j < window.CAPITAIS.length; j++) {
    const a = window.CAPITAIS[i];
    const b = window.CAPITAIS[j];
    const k = keyOf(a,b);
    if (!routeMap.has(k)) {
      const ca = COORDS[a];
      const cb = COORDS[b];
      if (ca && cb) {
        const d = Math.round(haversine(ca.lat, ca.lon, cb.lat, cb.lon));
        routeMap.set(k, d);
      }
    }
  }
}

window.ROUTES = Array.from(routeMap.entries()).map(([k,d]) => {
  const [a,b] = k.split('|');
  return { origin: a, destination: b, distance: d };
});

console.info(`ROUTES generated: ${window.ROUTES.length} entries (inclui substituições manuais).`);
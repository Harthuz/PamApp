// funcoes utilitarias de calculo geografico e ritmo de pacing

// calcula a distancia em quilometros entre dois pontos geograficos via haversine
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // raio medio da terra em quilometros
  const earthRadiusKm = 6371;

  // converte graus para radianos
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  // formula trigonometrica de haversine
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // retorna distancia em quilometros
  return earthRadiusKm * c;
}

// converte velocidade em metros por segundo para quilometros por hora
export function metersPerSecondToKmh(speedMps: number | null): number {
  // valida se a velocidade e nula ou negativa
  if (!speedMps || speedMps < 0) {
    return 0;
  }
  // multiplica pelo fator de conversao 3.6
  return Number((speedMps * 3.6).toFixed(1));
}

// formata o ritmo de pacing em minutos e segundos por quilometro a partir da velocidade em m/s
export function formatInstantPace(speedMps: number | null): string {
  // se velocidade for menor que 0.5 m/s (aproximadamente 1.8 km/h), considera parado
  if (!speedMps || speedMps < 0.5) {
    return `--'--"`;
  }

  // calcula segundos necessarios para percorrer 1000 metros
  const secondsPerKm = 1000 / speedMps;

  // limita valores extremos irreais para corrida/caminhada
  if (secondsPerKm > 3599) {
    return `--'--"`;
  }

  // divide em minutos e segundos restantes
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);

  // formata em dois digitos
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedMinutes}'${paddedSeconds}"`;
}

// formata o ritmo medio de pacing a partir do tempo total em segundos e distancia em km
export function formatAveragePace(totalSeconds: number, distanceKm: number): string {
  // valida se houve distancia suficiente percorrida
  if (!distanceKm || distanceKm < 0.05 || totalSeconds <= 0) {
    return `--'--"`;
  }

  // calcula segundos medios por quilometro
  const secondsPerKm = totalSeconds / distanceKm;

  // limita valores absurdos
  if (secondsPerKm > 3599) {
    return `--'--"`;
  }

  // separa minutos e segundos inteiros
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);

  // formata com zeros a esquerda
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedMinutes}'${paddedSeconds}"`;
}

// formata segundos em formato legivel hh:mm:ss ou mm:ss
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    const paddedHours = String(hours).padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
}

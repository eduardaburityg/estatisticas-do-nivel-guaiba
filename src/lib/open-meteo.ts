import type { Clima } from "./types";

// Coordenadas do centro de Porto Alegre/RS.
const LATITUDE = -30.0346;
const LONGITUDE = -51.2177;

export async function buscarClima(): Promise<Clima> {
  const params = new URLSearchParams({
    latitude: String(LATITUDE),
    longitude: String(LONGITUDE),
    current: "temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m",
    hourly: "temperature_2m,precipitation,precipitation_probability",
    daily: "precipitation_sum",
    forecast_days: "7",
    timezone: "America/Sao_Paulo",
  });

  const resposta = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    { next: { revalidate: 900 } }
  );

  if (!resposta.ok) {
    throw new Error(`Open-Meteo respondeu ${resposta.status}`);
  }

  const dados = await resposta.json();

  const agora = new Date();
  const horasFuturas = (dados.hourly.time as string[])
    .map((hora: string, i: number) => ({
      hora,
      temperaturaC: dados.hourly.temperature_2m[i] as number,
      chuvaMm: dados.hourly.precipitation[i] as number,
      probabilidadeChuva: dados.hourly.precipitation_probability[i] as number,
    }))
    .filter((p) => new Date(p.hora) >= agora)
    .slice(0, 12);

  const chuvaHoje = (dados.daily.precipitation_sum as number[])[0] ?? 0;
  const chuva7Dias = (dados.daily.precipitation_sum as number[]).reduce(
    (soma: number, mm: number) => soma + mm,
    0
  );

  return {
    temperaturaAtualC: dados.current.temperature_2m,
    sensacaoC: dados.current.apparent_temperature,
    chuvaHojeMm: Number(chuvaHoje.toFixed(1)),
    chuvaProximos7DiasMm: Number(chuva7Dias.toFixed(1)),
    ventoKmh: dados.current.wind_speed_10m,
    direcaoVento: dados.current.wind_direction_10m,
    previsaoHoraria: horasFuturas.map((p) => ({
      hora: new Date(p.hora).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temperaturaC: Math.round(p.temperaturaC),
      chuvaMm: p.chuvaMm,
      probabilidadeChuva: p.probabilidadeChuva,
    })),
    atualizadoEm: new Date().toISOString(),
    fonte: "Open-Meteo",
  };
}

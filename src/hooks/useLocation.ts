import { useCallback, useEffect, useRef, useState } from 'react';

export type LocationState = {
  latitude: number | null;
  longitude: number | null;
  /** Precisão da posição em metros (nível de confiança do GPS). */
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  /** Verdadeiro quando a precisão é muito ruim (> 1000 m, típico de localização por IP). */
  lowAccuracy: boolean;
  /** Solicita uma nova posição (botão de relocalizar). */
  relocate: () => void;
};

type LocationStateBase = Omit<LocationState, 'relocate'>;

// maximumAge baixo para evitar posições antigas em cache do navegador
const LOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 1000,
};

const LOW_ACCURACY_THRESHOLD_METERS = 1000;

const initialState: LocationStateBase = {
  latitude: null,
  longitude: null,
  accuracy: null,
  loading: true,
  error: null,
  lowAccuracy: false,
};

const isGeolocationAvailable = () =>
  typeof navigator !== 'undefined' && Boolean(navigator.geolocation);

export function useLocation(): LocationState {
  const [state, setState] = useState<LocationStateBase>(() =>
    isGeolocationAvailable()
      ? { ...initialState }
      : {
          ...initialState,
          loading: false,
          error: 'Geolocalização não suportada neste navegador. Informe seu CEP ou bairro.',
        }
  );
  const requestIdRef = useRef(0);

  const request = useCallback(() => {
    if (!isGeolocationAvailable()) return;

    const requestId = ++requestIdRef.current;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Descarta respostas de requisições obsoletas
        if (requestId !== requestIdRef.current) return;

        const { latitude, longitude, accuracy } = position.coords;
        const lowAccuracy =
          accuracy != null && accuracy > LOW_ACCURACY_THRESHOLD_METERS;

        setState({
          latitude,
          longitude,
          accuracy: accuracy ?? null,
          loading: false,
          error: lowAccuracy
            ? `Localização imprecisa (raio de ~${Math.round(accuracy)} m). Para resultados mais exatos, informe seu CEP ou bairro.`
            : null,
          lowAccuracy,
        });
      },
      (error) => {
        if (requestId !== requestIdRef.current) return;

        const messages: Record<number, string> = {
          [error.PERMISSION_DENIED]:
            'Permissão de localização negada. Informe seu CEP ou bairro para continuar.',
          [error.POSITION_UNAVAILABLE]:
            'Não foi possível obter sua posição. Informe seu CEP ou bairro.',
          [error.TIMEOUT]:
            'A localização demorou mais que o esperado. Informe seu CEP ou bairro.',
        };

        setState({
          ...initialState,
          loading: false,
          error:
            messages[error.code] ??
            'Não foi possível obter sua localização. Informe seu CEP ou bairro.',
        });
      },
      LOCATION_OPTIONS
    );
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { ...state, relocate: request };
}

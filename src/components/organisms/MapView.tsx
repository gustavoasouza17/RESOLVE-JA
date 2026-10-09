import { useCallback, useEffect, useRef } from 'react';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícones importados manualmente: o Vite quebra o caminho relativo padrão
// do Leaflet (images/marker-icon.png), então os assets são empacotados
// junto com o build.
import markerIconUrl from 'leaflet/dist/images/marker-icon.png?url';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png?url';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png?url';

const DEFAULT_CENTER: LatLngExpression = [-23.5505, -46.6333];

const defaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#1A2B4C;border:4px solid #FFD900;box-shadow:0 2px 8px rgba(0,0,0,0.3);" />`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char)
  );

export type MapProfessional = {
  uid: string;
  nome: string;
  categoria: string;
  nota: number;
  distanciaKm: number | null;
  latitude: number;
  longitude: number;
};

export type MapClientLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

type MapViewProps = {
  /** Posição do cliente (GPS ou fallback por CEP/bairro). */
  clientLocation: MapClientLocation | null;
  /** Apenas prestadores com coordenadas reais — sem coordenadas ficam fora do mapa. */
  professionals: MapProfessional[];
  onSelectProfessional?: (uid: string) => void;
  /** Botão de relocalizar — dispara uma nova leitura do GPS. */
  onRelocate?: () => void;
  /** Chama `invalidateSize()` quando o container volta a ficar visível. */
  visible?: boolean;
  loading?: boolean;
  /** Suprime a mensagem "Nenhum profissional…" enquanto os pins carregam. */
  loadingData?: boolean;
  /** Mensagem principal do estado vazio (sem profissionais na área). */
  emptyMessage?: string;
  /** Detalhe sob a mensagem do estado vazio (ex.: raio pesquisado). */
  emptyMessageDetail?: string;
  className?: string;
};

const MapView = ({
  clientLocation,
  professionals,
  onSelectProfessional,
  onRelocate,
  visible = true,
  loading = false,
  loadingData = false,
  emptyMessage = 'Nenhum profissional encontrado nesta área ainda.',
  emptyMessageDetail,
  className = '',
}: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const professionalsLayerRef = useRef<L.LayerGroup | null>(null);
  const boundsRef = useRef<LatLngExpression[]>([]);
  const onSelectRef = useRef(onSelectProfessional);

  // Mantém o callback de seleção atualizado sem re-criar os pins
  useEffect(() => {
    onSelectRef.current = onSelectProfessional;
  }, [onSelectProfessional]);

  const refitBounds = useCallback(() => {
    const map = mapRef.current;
    const points = boundsRef.current;
    if (!map || points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }

    map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 15 });
  }, []);

  // Inicializa o mapa uma única vez
  useEffect(() => {
    const map = L.map(mapContainerRef.current!, {
      center: DEFAULT_CENTER,
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    professionalsLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      professionalsLayerRef.current = null;
    };
  }, []);

  // Marcador do cliente + círculo de precisão + cálculo dos limites
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextBounds: LatLngExpression[] = [];

    if (clientLocation) {
      const latLng: LatLngExpression = [
        clientLocation.latitude,
        clientLocation.longitude,
      ];
      nextBounds.push(latLng);

      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng(latLng);
        accuracyCircleRef.current.setRadius(clientLocation.accuracy ?? 0);
      } else {
        accuracyCircleRef.current = L.circle(latLng, {
          radius: clientLocation.accuracy ?? 0,
          color: '#1A2B4C',
          weight: 1,
          fillColor: '#1A2B4C',
          fillOpacity: 0.12,
        }).addTo(map);
      }

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(latLng);
      } else {
        userMarkerRef.current = L.marker(latLng, {
          icon: userIcon,
          zIndexOffset: 500,
        })
          .addTo(map)
          .bindPopup('<strong>Você está aqui</strong>', { closeButton: false });
      }
    } else {
      if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
    }

    boundsRef.current = [
      ...nextBounds,
      ...professionals.map(
        (professional) =>
          [professional.latitude, professional.longitude] as [number, number]
      ),
    ];

    refitBounds();
  }, [clientLocation, professionals, refitBounds]);

  // Pins dos prestadores (layer próprio para limpeza barata)
  useEffect(() => {
    const layer = professionalsLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    professionals.forEach((professional) => {
      const marker = L.marker(
        [professional.latitude, professional.longitude],
        { icon: defaultIcon }
      );

      const distanceText =
        professional.distanciaKm != null
          ? `${professional.distanciaKm.toFixed(1)} km de distância`
          : 'Distância indisponível';

      const popupContent = `
        <div style="font-family:sans-serif;font-size:14px;line-height:1.45;min-width:180px;">
          <strong style="color:#1A2B4C;font-size:15px;">${escapeHtml(professional.nome)}</strong>
          <div style="color:#666;font-size:12px;margin-top:2px;">${escapeHtml(professional.categoria)}</div>
          <div style="margin-top:6px;font-size:12px;color:#888;">
            ★ ${professional.nota.toFixed(1)} · ${distanceText}
          </div>
          ${
            onSelectRef.current
              ? `<button
                  data-uid="${escapeHtml(professional.uid)}"
                  style="margin-top:8px;background:#FFD900;color:#1A2B4C;border:none;border-radius:12px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;width:100%;"
                >Ver perfil completo</button>`
              : ''
          }
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const button = document.querySelector(
          `[data-uid="${professional.uid}"]`
        );
        if (button) {
          button.addEventListener('click', () => {
            onSelectRef.current?.(professional.uid);
          });
        }
      });

      layer.addLayer(marker);
    });
  }, [professionals]);

  // Corrige mapa cortado/cinza ao alternar "Ver Mapa"/"Ver Lista"
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !visible) return;

    const frame = requestAnimationFrame(() => {
      map.invalidateSize({ pan: false });
      refitBounds();
    });

    return () => cancelAnimationFrame(frame);
  }, [visible, refitBounds]);

  const handleRecenter = () => {
    onRelocate?.();
    if (clientLocation) {
      mapRef.current?.setView(
        [clientLocation.latitude, clientLocation.longitude],
        14
      );
      userMarkerRef.current?.openPopup();
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200 ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[var(--color-navy)]" />
            <p className="text-sm text-slate-600">Obtendo sua localização…</p>
          </div>
        </div>
      )}

      <div ref={mapContainerRef} className="h-[220px] sm:h-[320px] md:h-[380px] w-full" />

      <button
        type="button"
        onClick={handleRecenter}
        className="absolute right-4 bottom-4 z-[1000] rounded-full bg-white px-4 py-3 text-sm font-semibold text-[var(--color-navy)] shadow-lg ring-1 ring-slate-200 transition hover:bg-slate-100"
      >
        📍 Recentrar mapa
      </button>

      {/* Estado vazio: busca concluída (loading encerrado) e
          sem profissionais na área/raio do mapa. */}
      {!loading && !loadingData && professionals.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[900] flex items-center justify-center p-5">
          <div className="w-full max-w-sm rounded-[24px] bg-white/95 px-6 py-5 text-center shadow-lg ring-1 ring-slate-200">
            <p className="text-2xl">📍</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {emptyMessage}
            </p>
            {emptyMessageDetail ? (
              <p className="mt-1 text-xs text-slate-500">
                {emptyMessageDetail}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issue with bundlers
// Using a stable CDN URL instead of the broken default path
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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

type MapViewProps = {
  professionals: {
    uid: string;
    nome: string;
    categoria: string;
    lat: number;
    lng: number;
    distance: number;
  }[];
  onSelectProfessional?: (uid: string) => void;
  onLocationError?: (message: string) => void;
  className?: string;
};

const MapView = ({ professionals, onSelectProfessional, onLocationError, className = '' }: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      const message = 'Geolocalização não suportada neste navegador.';
      setLocationError(message);
      setLoading(false);
      // Fallback: São Paulo center
      setUserLocation({ lat: -23.5505, lng: -46.6333 });
      onLocationError?.(message);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'Permissão de localização negada. Exibindo posição aproximada.'
            : 'Não foi possível obter sua localização. Exibindo posição aproximada.';

        setLocationError(message);
        setLoading(false);
        // Fallback: São Paulo center
        setUserLocation({ lat: -23.5505, lng: -46.6333 });
        onLocationError?.(message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // Initialize map once userLocation is available
  useEffect(() => {
    if (!userLocation || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current!, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom controls on the right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [userLocation]);

  // Add/update user marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<strong>Você está aqui</strong>', { closeButton: false });
      userMarkerRef.current = marker;
    }

    // Re-center when location updates
    mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], mapInstanceRef.current.getZoom());
  }, [userLocation]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current || !userLocation) return;
    mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
    userMarkerRef.current?.openPopup();
  };


  // Add professional markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

  // Remove old professional markers (keep user marker)
    map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker && layer !== userMarkerRef.current) {
        map.removeLayer(layer);
      }
    });

    professionals.forEach((prof) => {
      const marker = L.marker([prof.lat, prof.lng], { icon: defaultIcon }).addTo(map);

      const popupContent = `
        <div style="font-family:sans-serif;font-size:14px;line-height:1.4;min-width:160px;">
          <strong style="color:#1A2B4C;">${prof.nome}</strong><br/>
          <span style="color:#666;">${prof.categoria}</span><br/>
          <span style="color:#888;font-size:12px;">${prof.distance.toFixed(1)} km de distância</span>
          ${onSelectProfessional ? `<br/><button
            style="margin-top:8px;background:#FFD900;color:#1A2B4C;border:none;border-radius:12px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;width:100%;"
            data-uid="${prof.uid}"
          >Ver perfil</button>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        // Listen for button click inside popup
        const btn = document.querySelector(`[data-uid="${prof.uid}"]`);
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectProfessional?.(prof.uid);
          });
        }
      });
    });

    // Fit bounds to show all markers if there are professionals
    if (professionals.length > 0 && userLocation) {
      const allPoints: LatLngExpression[] = [
        [userLocation.lat, userLocation.lng],
        ...professionals.map((p) => [p.lat, p.lng] as [number, number]),
      ];
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [professionals, onSelectProfessional, userLocation]);

  return (
    <div className={`relative overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200 ${className}`}>
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[var(--color-navy)]" />
            <p className="text-sm text-slate-600">Obtendo sua localização…</p>
          </div>
        </div>
      )}

      {locationError && (
        <div className="absolute left-4 right-4 top-4 z-[1000] rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow-lg ring-1 ring-amber-200">
          {locationError}
        </div>
      )}

      <div ref={mapContainerRef} className="h-[220px] sm:h-[320px] md:h-[380px] w-full" />

      <button
        type="button"
        onClick={handleRecenter}
        className="absolute right-4 bottom-4 z-[1000] rounded-full bg-white px-4 py-3 text-sm font-semibold text-[var(--color-navy)] shadow-lg ring-1 ring-slate-200 transition hover:bg-slate-100"
      >
        Recentrar mapa
      </button>

      {professionals.length === 0 && !loading && (
        <div className="p-5">
          <p className="text-sm text-slate-600">
            Nenhum profissional encontrado nas proximidades.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyCepMask, isCompleteCep, onlyNumbers } from '../utils/cep';
import { haversineKm } from '../utils/geo';
import { withTimeout } from '../utils/async';
import { resolveCepLocation } from '../services/geocoding';
import { getProfessionals, type ProfessionalCardData } from '../services/professionals';

const LOOKUP_TIMEOUT_MS = 10000;

export function useNearbySearch() {
  const navigate = useNavigate();
  const [cepInput, setCepInput] = useState('');
  const [cepError, setCepError] = useState('');
  const [foundAddress, setFoundAddress] = useState<{ bairro: string; localidade: string; uf: string } | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<{ latitude: number; longitude: number; accuracy: number | null } | null>(null);
  const [cepResults, setCepResults] = useState<(ProfessionalCardData & { distance: number | null })[] | null>(null);
  const [cepSearching, setCepSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const handleCepChange = (v: string) => { setCepInput(applyCepMask(v)); if (cepError) setCepError(''); };

  const performCepSearch = async (numbers: string) => {
    if (!isCompleteCep(numbers)) { setCepError('CEP inválido. Verifique e tente novamente.'); return; }
    setCepError(''); setCepSearching(true);
    try {
      let resolved: Awaited<ReturnType<typeof resolveCepLocation>>;
      try {
        resolved = await withTimeout(resolveCepLocation(numbers), LOOKUP_TIMEOUT_MS);
      } catch (error) {
        console.error('Erro ao localizar CEP:', error);
        setCepError('Não foi possível localizar este CEP. Verifique sua conexão e tente novamente.');
        return;
      }

      if (!resolved) { setCepError('CEP não encontrado. Verifique e tente novamente.'); return; }
      setFoundAddress({ bairro: resolved.address.bairro, localidade: resolved.address.localidade, uf: resolved.address.uf });
      setSearchedLocation({ latitude: resolved.point.latitude, longitude: resolved.point.longitude, accuracy: null });
      setHasSearched(true);

      try {
        const data = await withTimeout(getProfessionals(), LOOKUP_TIMEOUT_MS);
        const target = resolved.address.bairro.toLowerCase();
        const filtered = data
          .filter((p) => (p.bairrosAtendimento ?? []).some((b) => b.toLowerCase().includes(target)))
          .map((p) => ({ ...p, distance: p.latitude != null && p.longitude != null ? haversineKm(resolved.point, { latitude: p.latitude, longitude: p.longitude }) : null }))
          .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        setCepResults(filtered);
      } catch (error) {
        console.error('Erro ao carregar profissionais para o CEP:', error);
        setCepError('Localização encontrada, mas não foi possível carregar os profissionais. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setCepSearching(false);
    }
  };

  const handleCepSubmit = (e: React.FormEvent) => { e.preventDefault(); void performCepSearch(onlyNumbers(cepInput)); };
  const handleCepReset = () => { setCepInput(''); setFoundAddress(null); setSearchedLocation(null); setCepResults(null); setHasSearched(false); setCepError(''); };

  const mapProfessionals = useMemo(() => {
    const source = cepResults ?? [];
    return source.filter((p) => p.latitude != null && p.longitude != null).slice(0, 12).map((p) => ({
      uid: p.uid, nome: p.nome, categoria: p.categorias[0] ?? 'Profissional', nota: p.avaliacaoMedia,
      distanciaKm: p.distance ?? p.distanciaKm, latitude: p.latitude!, longitude: p.longitude!,
    }));
  }, [cepResults]);

  return { cepInput, cepError, foundAddress, searchedLocation, cepResults, cepSearching, hasSearched, viewMode, setViewMode, handleCepChange, handleCepSubmit, handleCepReset, performCepSearch, mapProfessionals, navigate };
}
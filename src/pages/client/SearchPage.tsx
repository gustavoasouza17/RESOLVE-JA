import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import BottomNav from "../../components/organisms/BottomNav";
import MapView from "../../components/organisms/MapView";
import Button from "../../components/atoms/Button";
import StarRating from "../../components/atoms/StarRating";
import categories from "../../constants/categories";
import { getProfessionals, type ProfessionalCardData } from "../../services/professionals";

// São Paulo approximate center (fallback)
const SP_CENTER = { lat: -23.5505, lng: -46.6333 };

function generateCoord(
  baseLat: number,
  baseLng: number,
  distanceKm: number,
  seed: number,
): { lat: number; lng: number } {
  const angle = (seed * 137.5) % 360;
  const rad = (angle * Math.PI) / 180;
  const latOffset = (distanceKm / 111) * Math.cos(rad);
  const lngOffset = (distanceKm / 102) * Math.sin(rad);
  return { lat: baseLat + latOffset, lng: baseLng + lngOffset };
}

const normalizeCategoryValue = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");

const resolveCategoryFromParam = (param?: string) => {
  if (!param) return "";

  const normalizedParam = normalizeCategoryValue(param);
  const match = categories.find(
    (category) => normalizeCategoryValue(category.nome) === normalizedParam,
  );

  return match?.nome ?? "";
};

const SearchPage = () => {
  const { categoria } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance");
  const [professionals, setProfessionals] = useState<ProfessionalCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const safetyTimeout = window.setTimeout(() => {
      setLoading((prev) => (prev ? false : prev));
    }, 3000);

    const load = async () => {
      try {
        const data = await getProfessionals();
        if (!cancelled) {
          setProfessionals(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      window.clearTimeout(safetyTimeout);
    };
  }, []);

  useEffect(() => {
    setSelectedCategory(resolveCategoryFromParam(categoria));
  }, [categoria]);

  const lowerCategory = selectedCategory.toLowerCase();
  const query = search.toLowerCase();

  let filtered = professionals.filter((professional) => {
    if (lowerCategory) {
      const matchesCategory = professional.categorias.some((cat) =>
        cat.toLowerCase().includes(lowerCategory),
      );
      if (!matchesCategory) return false;
    }
    if (query) {
      const matchesSearch =
        professional.nome.toLowerCase().includes(query) ||
        professional.categorias.some((cat) =>
          cat.toLowerCase().includes(query),
        ) ||
        professional.bio.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    return true;
  });

  if (sortBy === "distance") {
    filtered = [...filtered].sort((a, b) => a.distanciaKm - b.distanciaKm);
  } else {
    filtered = [...filtered].sort(
      (a, b) => b.avaliacaoMedia - a.avaliacaoMedia,
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setSearchParams({ q: search.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryClick = (cat: string) => {
    const nextCategory =
      selectedCategory.toLowerCase() === cat.toLowerCase() ? "" : cat;

    setSelectedCategory(nextCategory);

    if (nextCategory) {
      navigate(`/buscar/${encodeURIComponent(nextCategory)}`);
    } else {
      navigate("/buscar");
    }
  };

  const handleSelectProfessional = (uid: string) => {
    navigate(`/profissional/${uid}`, {
      state: {
        fromSearch: true,
        category: selectedCategory,
        query: search.trim(),
      },
    });
  };

  const mapProfessionals = filtered.slice(0, 8).map((p, i) => {
    const coord = generateCoord(
      SP_CENTER.lat,
      SP_CENTER.lng,
      p.distanciaKm,
      i + 1,
    );
    return {
      uid: p.uid,
      nome: p.nome,
      categoria: p.categorias[0],
      lat: coord.lat,
      lng: coord.lng,
      distance: p.distanciaKm,
    };
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
      <BottomNav variant="client" />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                {selectedCategory || "Buscar"}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {selectedCategory
                  ? `Profissionais de ${selectedCategory}`
                  : "Encontre o profissional ideal"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {filtered.length === 0
                  ? "Nenhum profissional encontrado para essa busca."
                  : `${filtered.length} ${filtered.length === 1 ? "profissional encontrado" : "profissionais encontrados"} perto de você.`}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="inline-flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              ← Tela principal
            </Button>
          </div>

          {/* Header */}
          <div></div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar profissionais, categorias ou serviços…"
              className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 pl-12 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              🔍
            </span>
          </form>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((c) => c.ativa)
              .map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.nome)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory.toLowerCase() === cat.nome.toLowerCase()
                      ? "bg-[var(--color-navy)] text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat.nome}
                </button>
              ))}
          </div>

          {/* Sort + View toggle bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setSortBy("distance")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  sortBy === "distance"
                    ? "bg-[var(--color-navy)] text-white"
                    : "bg-transparent text-slate-700 hover:bg-slate-100"
                }`}
              >
                Mais próximos
              </button>
              <button
                type="button"
                onClick={() => setSortBy("rating")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  sortBy === "rating"
                    ? "bg-[var(--color-navy)] text-white"
                    : "bg-transparent text-slate-700 hover:bg-slate-100"
                }`}
              >
                Melhor avaliados
              </button>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  viewMode === "list"
                    ? "bg-[var(--color-navy)] text-white"
                    : "bg-transparent text-slate-700 hover:bg-slate-100"
                }`}
              >
                Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  viewMode === "map"
                    ? "bg-[var(--color-navy)] text-white"
                    : "bg-transparent text-slate-700 hover:bg-slate-100"
                }`}
              >
                Mapa
              </button>
            </div>
          </div>

          {/* Results — empty state */}
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-[32px] bg-white py-20 shadow-sm ring-1 ring-slate-200">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
              <p className="mt-4 text-sm text-slate-600">Carregando profissionais…</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center rounded-[32px] bg-rose-50 py-16 shadow-sm ring-1 ring-rose-200">
              <span className="text-4xl">⚠️</span>
              <h2 className="mt-4 text-xl font-bold text-rose-900">Erro ao carregar profissionais</h2>
              <p className="mt-2 max-w-md text-center text-sm text-rose-700">Tente novamente em instantes.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[32px] bg-white py-20 shadow-sm ring-1 ring-slate-200">
              <span className="text-5xl">🔍</span>
              <h2 className="mt-6 text-xl font-bold text-[var(--color-navy)]">
                Nenhum resultado encontrado
              </h2>
              <p className="mt-2 max-w-md text-center text-sm text-slate-600">
                Tente ajustar os filtros ou buscar por outro termo.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("");
                  setSearchParams({});
                }}
                className="mt-6 rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--color-navy)] transition hover:brightness-95"
              >
                Limpar filtros
              </button>
            </div>
          ) : viewMode === "list" ? (
            /* Results — list view */
            <div className="space-y-6">
              {filtered.map((professional) => (
                <article
                  key={professional.uid}
                  className="rounded-[32px] bg-white shadow-lg shadow-slate-200/40 ring-1 ring-slate-200"
                >
                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6 shadow-xl rounded-[32px] bg-white">
                    <div className="w-full shrink-0 sm:w-44 md:w-48 lg:w-52">
                      <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 p-0 shadow-sm">
                        <div className="aspect-[3/4] overflow-hidden rounded-[18px] bg-white">
                          <img
                            src={professional.fotoUrl}
                            alt={`${professional.nome} — ${professional.categorias[0]}`}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="absolute left-3 top-3 rounded-2xl bg-slate-900/80 px-3 py-2 text-sm font-semibold text-white">
                          ★ {professional.avaliacaoMedia.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold text-[var(--color-navy)]">
                            {professional.nome}
                          </h2>
                          <p className="text-sm text-slate-500">
                            {professional.categorias[0]}
                          </p>
                        </div>
                        <Link
                          to={`/profissional/${professional.uid}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-primary)] bg-[var(--color-primary)]/10 px-5 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/20"
                        >
                          Ver perfil completo →
                        </Link>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                          <p className="text-sm text-slate-500">Avaliações</p>
                          <div className="mt-2 flex items-center gap-2">
                            <StarRating
                              value={professional.avaliacaoMedia}
                              readOnly
                              size="sm"
                            />
                            <span className="text-sm text-slate-600">
                              ({professional.totalAvaliacoes} avaliações)
                            </span>
                          </div>
                        </div>
                        <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                          <p className="text-sm text-slate-500">Serviços</p>
                          <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">
                            {professional.totalServicos}
                          </p>
                        </div>
                        <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                          <p className="text-sm text-slate-500">Distância</p>
                          <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">
                            {professional.distanciaKm.toFixed(1)} km
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Results — map view */
            <MapView
              professionals={mapProfessionals}
              onSelectProfessional={handleSelectProfessional}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

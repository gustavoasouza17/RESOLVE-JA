import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { MockProposal } from '../constants/mockProposals';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateProposalData = {
  prestadorId: string;
  clienteId: string;
  clienteNome: string;
  descricao: string;
  endereco: string;
  dataDesejada: string;
  orcamentoCliente: number;
};

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Salva uma nova proposta no Firestore (coleção `proposals`).
 */
export async function createProposal(data: CreateProposalData): Promise<string> {
  const docRef = await addDoc(collection(db, 'proposals'), {
    ...data,
    status: 'pendente',
    criadoEm: new Date().toISOString(),
    atualizadoEm: null,
    contraPropostaPrestador: null,
  });
  return docRef.id;
}

export async function updateProposalStatus(
  proposalId: string,
  status: 'pendente' | 'aceita' | 'recusada' | 'concluido',
): Promise<void> {
  const ref = doc(db, 'proposals', proposalId);
  await updateDoc(ref, {
    status,
    atualizadoEm: new Date().toISOString(),
  });
}

export async function getProposalById(proposalId: string): Promise<MockProposal | null> {
  try {
    const ref = doc(db, 'proposals', proposalId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const d = snap.data();
    return {
      id: snap.id,
      clienteId: d.clienteId ?? '',
      clienteNome: d.clienteNome ?? '',
      prestadorId: d.prestadorId ?? '',
      descricao: d.descricao ?? '',
      endereco: d.endereco ?? '',
      dataDesejada: d.dataDesejada ?? '',
      orcamentoCliente: d.orcamentoCliente ?? 0,
      contraPropostaPrestador: d.contraPropostaPrestador ?? undefined,
      status: d.status ?? 'pendente',
      criadoEm:
        d.criadoEm instanceof Timestamp
          ? d.criadoEm.toDate().toISOString()
          : typeof d.criadoEm === 'string'
            ? d.criadoEm
            : new Date().toISOString(),
      atualizadoEm: d.atualizadoEm ?? undefined,
    } as MockProposal & { clienteNome?: string };
  } catch (error) {
    console.warn('Erro ao buscar proposta por id:', error);
    return null;
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Busca todas as propostas destinadas a um prestador específico.
 * Retorna no formato compatível com MockProposal para facilitar a mesclagem com mocks.
 */
export async function getProposalsForPrestador(
  prestadorId: string,
): Promise<MockProposal[]> {
  try {
    const q = query(
      collection(db, 'proposals'),
      where('prestadorId', '==', prestadorId),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          clienteId: d.clienteId ?? '',
          clienteNome: d.clienteNome ?? '',
          prestadorId: d.prestadorId ?? '',
          descricao: d.descricao ?? '',
          endereco: d.endereco ?? '',
          dataDesejada: d.dataDesejada ?? '',
          orcamentoCliente: d.orcamentoCliente ?? 0,
          contraPropostaPrestador: d.contraPropostaPrestador ?? undefined,
          status: d.status ?? 'pendente',
          criadoEm:
            d.criadoEm instanceof Timestamp
              ? d.criadoEm.toDate().toISOString()
              : typeof d.criadoEm === 'string'
                ? d.criadoEm
                : new Date().toISOString(),
          atualizadoEm: d.atualizadoEm ?? undefined,
        } as MockProposal & { clienteNome?: string };
      })
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
  } catch (error) {
    console.warn('Erro ao buscar propostas do Firestore:', error);
    return [];
  }
}

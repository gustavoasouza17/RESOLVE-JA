import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

export type NotificationType =
  | 'nova_solicitacao'
  | 'nova_avaliacao'
  | 'visualizacao_perfil';

export type Notification = {
  id: string;
  destinatarioId: string;
  tipo: NotificationType;
  titulo: string;
  mensagem: string;
  referenciaId: string;
  lida: boolean;
  criadoEm: Date;
};

export type CreateNotificationData = {
  destinatarioId: string;
  tipo: NotificationType;
  titulo: string;
  mensagem: string;
  referenciaId: string;
};

export async function createNotification(
  data: CreateNotificationData,
): Promise<string> {
  const docRef = await addDoc(collection(db, 'notifications'), {
    ...data,
    lida: false,
    criadoEm: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getNotificationsForUser(
  destinatarioId: string,
): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('destinatarioId', '==', destinatarioId),
      orderBy('criadoEm', 'desc'),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((snap) => {
      const d = snap.data() as {
        destinatarioId: string;
        tipo: NotificationType;
        titulo: string;
        mensagem: string;
        referenciaId: string;
        lida: boolean;
        criadoEm: unknown;
      };

      let criadoEm: Date;
      if (d.criadoEm && typeof d.criadoEm === 'object' && 'toDate' in d.criadoEm) {
        criadoEm = (d.criadoEm as { toDate: () => Date }).toDate();
      } else if (d.criadoEm instanceof Date) {
        criadoEm = d.criadoEm;
      } else {
        criadoEm = new Date();
      }

      return {
        id: snap.id,
        destinatarioId: d.destinatarioId,
        tipo: d.tipo,
        titulo: d.titulo,
        mensagem: d.mensagem,
        referenciaId: d.referenciaId,
        lida: d.lida,
        criadoEm,
      };
    });
  } catch (error) {
    console.warn('Erro ao buscar notificações:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const ref = doc(db, 'notifications', notificationId);
  await updateDoc(ref, { lida: true });
}

export function subscribeToUnreadCount(
  destinatarioId: string,
  callback: (count: number) => void,
) {
  const q = query(
    collection(db, 'notifications'),
    where('destinatarioId', '==', destinatarioId),
    where('lida', '==', false),
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}

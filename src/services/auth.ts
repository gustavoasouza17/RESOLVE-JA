import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import type { AuthError } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase";

// ─── Error translation map ────────────────────────────────────────────────────
const ptBrErrors: Record<string, string> = {
  "permission-denied":
    "Permissão insuficiente no Firestore. Verifique as Regras de Segurança (Rules) no Firebase Console.",
  "auth/user-not-found":
    "E-mail não encontrado. Verifique se digitou corretamente.",
  "auth/wrong-password": "Senha incorreta. Tente novamente.",
  "auth/invalid-credential": "E-mail ou senha inválidos.",
  "auth/email-already-in-use":
    "Este e-mail já está cadastrado. Faça login ou use outro e-mail.",
  "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
  "auth/invalid-email": "O formato do e-mail é inválido.",
  "auth/too-many-requests":
    "Conta temporariamente bloqueada por muitas tentativas. Tente novamente mais tarde.",
  "auth/network-request-failed":
    "Sem conexão com a internet. Verifique sua rede e tente novamente.",
  "auth/user-disabled":
    "Esta conta foi desativada. Entre em contato com o suporte.",
  "auth/operation-not-allowed":
    "Este método de login não está habilitado no momento.",
  "auth/requires-recent-login":
    "Por segurança, faça login novamente antes de alterar estas informações.",
};

function translateError(
  error: AuthError | { code?: string; message?: string },
): string {
  const code = error.code ?? "";
  if (
    code === "permission-denied" ||
    error.message?.includes("Missing or insufficient permissions")
  ) {
    return "Permissão insuficiente no banco de dados (Firestore). Verifique as Regras de Segurança (Rules) no Firebase Console.";
  }
  return (
    ptBrErrors[code] ?? error.message ?? "Erro desconhecido. Tente novamente."
  );
}

// ─── Firebase Auth helpers ─────────────────────────────────────────────────────

/**
 * Verifica no Firestore se um CPF já está em uso.
 * Percorre todos os documentos da coleção `users` comparando o campo `cpf`.
 */
async function checkCpfDuplicity(cpf: string): Promise<string | null> {
  try {
    const q = query(collection(db, "users"), where("cpf", "==", cpf));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return "Este CPF já está cadastrado em outra conta.";
    }
    return null;
  } catch {
    return null; // se falhar, deixa passar — a validação real virá na criação
  }
}

/**
 * Login com e-mail e senha.
 * @returns Objeto com `user` (firebase User) e `profile` (dados do Firestore).
 */
export async function loginWithEmail(email: string, senha: string) {
  const credential = await signInWithEmailAndPassword(auth, email, senha);
  const user = credential.user;

  // Busca dados complementares no Firestore
  let profileData: Record<string, unknown> | null = null;
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    profileData = userDoc.exists()
      ? (userDoc.data() as Record<string, unknown>)
      : null;
  } catch (error) {
    console.warn(
      "Não foi possível carregar o perfil do Firestore (permissão ou erro de rede):",
      error,
    );
  }

  // Verifica se a conta está suspensa
  if (profileData?.status === "suspended") {
    await signOut(auth);
    throw new Error("Conta suspensa. Entre em contato com o suporte.");
  }

  return { user, profile: profileData };
}

/**
 * Registro com e-mail, senha e dados adicionais.
 * Cria o usuário no Auth e, em seguida, um documento na coleção `users` no Firestore.
 * Se o perfil for "prestador", cria também um documento separado na coleção `professionals`.
 *
 * @param email       E-mail do usuário
 * @param senha       Senha escolhida
 * @param dados       Dados adicionais (nome, telefone, cpf, perfil)
 */
export async function registerWithEmail(
  email: string,
  senha: string,
  dados: {
    nome: string;
    telefone: string;
    cpf: string;
    perfil: "cliente" | "prestador";
    categorias?: string[];
  },
) {
  // 1. Verifica duplicidade de CPF antes de criar
  const cpfError = await checkCpfDuplicity(dados.cpf);
  if (cpfError) {
    throw new Error(cpfError);
  }

  // 2. Cria o usuário no Firebase Auth
  const credential = await createUserWithEmailAndPassword(auth, email, senha);
  const user = credential.user;

  // 3. Atualiza o displayName no Auth (opcional, útil para exibição rápida)
  await updateProfile(user, { displayName: dados.nome });

  // 4. Persiste dados do usuário no Firestore (coleção `users`) — campos em português
  const userData: Record<string, unknown> = {
    uid: user.uid,
    nome: dados.nome,
    email,
    telefone: dados.telefone,
    cpf: dados.cpf,
    perfil: dados.perfil,
    fotoUrl: "",
    cidade: "",
    status: "ativo",
    criadoEm: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", user.uid), userData);

  // 5. Se for prestador, cria documento SEPARADO na coleção `professionals`
  if (dados.perfil === "prestador") {
    const professionalData: Record<string, unknown> = {
      uid: user.uid,
      userId: user.uid,
      nome: dados.nome,
      bio: "",
      fotoUrl: "",
      whatsapp: "",
      categorias: dados.categorias || [],
      bairrosAtendimento: [],
      portfolio: [],
      disponibilidade: {},
      totalServicos: 0,
      distanciaKm: 0,
      avaliacaoMedia: 0,
      totalAvaliacoes: 0,
      valorDiaria: "",
      plano: "free",
      status: "ativo",
      criadoEm: new Date().toISOString(),
    };

    await setDoc(doc(db, "professionals", user.uid), professionalData);
  }

  return { user, profile: userData };
}

/**
 * Logout — encerra a sessão do Firebase Auth.
 */
export async function logout() {
  await signOut(auth);
}

/**
 * Envia e-mail de redefinição de senha.
 */
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// ─── Re-export do tradutor para uso em outros lugares ─────────────────────────
export { translateError };
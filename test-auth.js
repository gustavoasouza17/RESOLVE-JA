npm /**
 * Script para testar login dos usuários no Firebase Authentication
 * Usa a REST API do Firebase (Identity Toolkit) — não requer SDK extra.
 *
 * Uso: node test-auth.js
 */

const API_KEY = 'AIzaSyAFkyySTQL-fKiffmMRFA_VBeb3yqriJ6Q';
const URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;

const usuarios = [
  { email: 'cliente1@resolveja.com',   nome: 'Cliente 1' },
  { email: 'prestador1@resolveja.com', nome: 'Prestador 1' },
  { email: 'admin@resolveja.com',      nome: 'Admin' },
];

const SENHA = '123456';

async function testarLogin(email, nome) {
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: SENHA,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅  ${nome.padEnd(14)} (${email})  —  Login OK`);
      console.log(`    UID: ${data.localId}`);
      console.log(`    Token (primeiros 20 chars): ${data.idToken.substring(0, 20)}...`);
      console.log('');
      return { email, nome, sucesso: true, uid: data.localId };
    } else {
      const mensagem =
        data.error?.message === 'EMAIL_NOT_FOUND'
          ? 'E-mail não encontrado no Firebase Auth'
          : data.error?.message === 'INVALID_PASSWORD'
          ? 'Senha incorreta'
          : data.error?.message === 'INVALID_LOGIN_CREDENTIALS'
          ? 'Credenciais inválidas'
          : data.error?.message ?? 'Erro desconhecido';

      console.log(`❌  ${nome.padEnd(14)} (${email})  —  Falha: ${mensagem}`);
      console.log('');
      return { email, nome, sucesso: false, erro: mensagem };
    }
  } catch (err) {
    console.log(`❌  ${nome.padEnd(14)} (${email})  —  Erro de rede: ${err.message}`);
    console.log('');
    return { email, nome, sucesso: false, erro: err.message };
  }
}

console.log('══════════════════════════════════════════════════');
console.log('  Teste de login — Firebase Authentication');
console.log('  Senha: 123456');
console.log('══════════════════════════════════════════════════\n');

const resultados = await Promise.all(usuarios.map((u) => testarLogin(u.email, u.nome)));

console.log('──────────────────────────────────────────────────');
const sucessos = resultados.filter((r) => r.sucesso).length;
const falhas = resultados.filter((r) => !r.sucesso).length;
console.log(`  Total: ${resultados.length}  |  Sucesso: ${sucessos}  |  Falhas: ${falhas}`);
console.log('──────────────────────────────────────────────────\n');
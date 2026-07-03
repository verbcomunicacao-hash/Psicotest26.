// firebase-integracao.js
// Integração com Firebase - SDK v10 Modular
// Configuração real do projeto do Wilson

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// Chaves reais do Firebase do Wilson
const firebaseConfig = {
  apiKey: "AIzaSyDxthRLebW6-CR92Tfvi1f-9Soi_wYEyqQ",
  authDomain: "psicoteste26.firebaseapp.com",
  projectId: "psicoteste26",
  storageBucket: "psicoteste26.firebasestorage.app",
  messagingSenderId: "346801843137",
  appId: "1:346801843137:web:ba924eb27680ffa78edd40",
  measurementId: "G-2WVVMCETLN",
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (erro) {
  console.warn("Analytics não pôde ser inicializado:", erro);
}

/**
 * Salva o resultado de um teste psicológico no Firestore.
 * @param {Object} resultado - Objeto contendo os dados do resultado do teste.
 * @param {string} resultado.pacienteId - Identificador do paciente.
 * @param {string} resultado.teste - Nome do teste realizado.
 * @param {number} resultado.pontuacao - Pontuação obtida.
 * @param {Object} [resultado.detalhes] - Detalhes adicionais do teste.
 * @returns {Promise<string>} ID do documento criado.
 */
async function salvarResultadoTeste(resultado) {
  if (!resultado || !resultado.pacienteId) {
    throw new Error("Resultado inválido: pacienteId é obrigatório.");
  }

  const dados = {
    pacienteId: resultado.pacienteId,
    teste: resultado.teste || "",
    pontuacao: typeof resultado.pontuacao === "number" ? resultado.pontuacao : 0,
    detalhes: resultado.detalhes || {},
    criadoEm: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "resultadosTestes"), dados);
  return docRef.id;
}

/**
 * Busca a evolução de um paciente (histórico de resultados) ordenada por data.
 * @param {string} pacienteId - Identificador do paciente.
 * @returns {Promise<Array<Object>>} Lista de resultados do paciente.
 */
async function buscarEvolucaoPaciente(pacienteId) {
  if (!pacienteId) {
    throw new Error("pacienteId é obrigatório para buscar a evolução.");
  }

  const ref = collection(db, "resultadosTestes");
  const q = query(ref, orderBy("criadoEm", "asc"));
  const snapshot = await getDocs(q);

  const evolucao = [];
  snapshot.forEach((documento) => {
    const dados = documento.data();
    if (dados && dados.pacienteId === pacienteId) {
      evolucao.push({
        id: documento.id,
        ...dados,
      });
    }
  });

  return evolucao;
}

/**
 * Salva (ou atualiza) o apelido de um paciente.
 * @param {string} pacienteId - Identificador do paciente.
 * @param {string} apelido - Apelido a ser salvo.
 * @returns {Promise<void>}
 */
async function salvarApelido(pacienteId, apelido) {
  if (!pacienteId) {
    throw new Error("pacienteId é obrigatório para salvar o apelido.");
  }
  if (typeof apelido !== "string" || apelido.trim() === "") {
    throw new Error("Apelido inválido.");
  }

  const ref = doc(db, "apelidos", pacienteId);
  await setDoc(
    ref,
    {
      apelido: apelido.trim(),
      atualizadoEm: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Busca o apelido salvo de um paciente.
 * @param {string} pacienteId - Identificador do paciente.
 * @returns {Promise<string|null>} Apelido do paciente ou null se não existir.
 */
async function buscarApelido(pacienteId) {
  if (!pacienteId) {
    throw new Error("pacienteId é obrigatório para buscar o apelido.");
  }

  const ref = doc(db, "apelidos", pacienteId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  const dados = snapshot.data();
  return dados && typeof dados.apelido === "string" ? dados.apelido : null;
}

export {
  app,
  db,
  analytics,
  salvarResultadoTeste,
  buscarEvolucaoPaciente,
  salvarApelido,
  buscarApelido,
};

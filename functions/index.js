const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * CONFIGURAÇÃO PADRÃO
 * O admin pode mudar isso depois direto no Firestore
 */
const DEFAULT_QUEUES = [
  { horario: "Jogar Agora", formato: "MD1", ordem: 0 },
  { horario: "14:00", formato: "MD3", ordem: 14 },
  { horario: "17:00", formato: "MD3", ordem: 17 },
  { horario: "20:00", formato: "MD3", ordem: 20 },
  { horario: "23:00", formato: "MD5", ordem: 23 },
];

/**
 * ⏰ RODA TODO DIA ÀS 08:00 (horário de Brasília)
 */
exports.criarFilasDiarias = functions.pubsub
  .schedule("0 8 * * *")
  .timeZone("America/Sao_Paulo")
  .onRun(async () => {

    const queuesRef = db.collection("queues");

    // 🔥 Apaga filas antigas
    const antigas = await queuesRef.get();
    const batchDelete = db.batch();
    antigas.forEach(doc => batchDelete.delete(doc.ref));
    await batchDelete.commit();

    // ✅ Cria novas filas
    const batchCreate = db.batch();

    DEFAULT_QUEUES.forEach(q => {
      const ref = queuesRef.doc();
      batchCreate.set(ref, {
        horario: q.horario,
        formato: q.formato,
        ordem: q.ordem,
        status: "aberta",
        criadaEm: admin.firestore.FieldValue.serverTimestamp(),
        lanes: {
          top: [],
          jg: [],
          mid: [],
          adc: [],
          sup: []
        },
        overflow: []
      });
    });

    await batchCreate.commit();

    console.log("✅ Filas do dia criadas com sucesso!");
    return null;
  });

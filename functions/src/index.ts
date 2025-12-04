import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();

// Executa quando o usuário é criado
export const setCompanyClaim = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;

  const userDoc = await admin.firestore()
    .collection("users")
    .doc(uid)
    .get();

  if (!userDoc.exists) {
    console.log("Usuário sem documento no Firestore.");
    return null;
  }

  const data = userDoc.data();
  const companyId = data?.companyId;

  if (!companyId) {
    console.log("Usuário sem companyId.");
    return null;
  }

  await admin.auth().setCustomUserClaims(uid, { companyId });

  console.log(`Custom claim aplicado ao usuário ${uid}: ${companyId}`);

  return null;
});

// Função opcional para atualizar claims
export const refreshToken = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;

  if (!uid) return { error: "Usuário não autenticado." };

  const userDoc = await admin.firestore()
    .collection("users")
    .doc(uid)
    .get();

  if (!userDoc.exists) return { error: "Documento do usuário não existe." };

  const dataDoc = userDoc.data();
  const companyId = dataDoc?.companyId;

  if (!companyId) return { error: "Usuário sem companyId." };

  await admin.auth().setCustomUserClaims(uid, { companyId });

  return { companyId };
});

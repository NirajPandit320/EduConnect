import { db } from "../utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const saveScore = async (score, total, uid) => {
  try {
    const percentage = (score / total) * 100;

    await addDoc(collection(db, "scores"), {
      uid, // ✅ ADD THIS
      score,
      totalQuestions: total,
      percentage,
      createdAt: serverTimestamp(),
    });

    console.log("✅ Score saved");
  } catch (error) {
    console.error("❌ Error:", error);
  }
};
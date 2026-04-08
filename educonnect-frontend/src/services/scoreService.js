import { db } from "../utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { API_BASE_URL } from "../utils/apiConfig";

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

    try {
      await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: uid,
          senderId: uid,
          type: "quiz",
          text: `You scored ${score}/${total} in a quiz`,
          link: "/quizzes",
        }),
      });
    } catch (notificationError) {
      console.error("❌ Notification error:", notificationError);
    }

    console.log("✅ Score saved");
  } catch (error) {
    console.error("❌ Error:", error);
  }
};
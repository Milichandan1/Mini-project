import { answerPollutionQuestion } from "../services/chatService.js";

export async function chat(req, res, next) {
  try {
    const { question, city } = req.body;
    if (!question) {
      return res.status(400).json({ message: "question is required" });
    }
    const answer = await answerPollutionQuestion(question, city);
    res.json({ answer });
  } catch (error) {
    next(error);
  }
}


import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume required" });
        }
        const filepath = req.file.path;
        const fileBuffer = await fs.promises.readFile(filepath);
        const uint8Array = new Uint8Array(fileBuffer);
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }

        resumeText = resumeText.replace(/\s+/g, " ").trim();

        const messages = [
            {
                role: "system",
                content: `Extract structured data from resume. Return strictly JSON: { "role": "string", "experience": "string", "projects": ["p1", "p2"], "skills": ["s1", "s2"] }`
            },
            { role: "user", content: resumeText }
        ];

        const aiResponse = await askAi(messages);
        const parsed = JSON.parse(aiResponse);
        fs.unlinkSync(filepath);

        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ message: error.message });
    }
};

export const generateQuestion = async (req, res) => {
    try {
        let { role, experience, mode, resumeText, projects, skills } = req.body;
        const user = await User.findById(req.userId);
        if (!user || user.credits < 50) return res.status(400).json({ message: "Not enough credits or user not found" });

        const messages = [
            {
                role: "system",
                content: `You are a real human interviewer. Generate exactly 5 questions based on provided details. 15-25 words each, single line, no numbering.`
            },
            { role: "user", content: `Role:${role}, Experience:${experience}, Mode:${mode}, Skills:${skills}` }
        ];

        const aiResponse = await askAi(messages);
        const questionArray = aiResponse.split("\n").map(q => q.trim()).filter(q => q.length > 0).slice(0, 5);

        user.credits -= 50;
        await user.save();

        const interview = await Interview.create({
            userId: user._id,
            role, experience, mode,
            resumeText: resumeText || "None",
            questions: questionArray.map((q, index) => ({
                question: q,
                difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
                timeLimit: [60, 60, 90, 90, 120][index],
            }))
        });

        res.json({ interviewId: interview._id, creditsLeft: user.credits, userName: user.name, questions: interview.questions });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body;
        const interview = await Interview.findById(interviewId);
        const question = interview.questions[questionIndex];

        if (!answer || timeTaken > question.timeLimit) {
            question.score = 0;
            question.feedback = "Evaluated zero due to time or missing answer.";
            question.answer = answer || "";
            await interview.save();
            return res.json({ feedback: question.feedback });
        }

        const messages = [
            { role: "system", content: `Evaluate answer. Return ONLY JSON: { "confidence": num, "communication": num, "correctness": num, "finalScore": num, "feedback": "string" }` },
            { role: "user", content: `Question: ${question.question} Answer: ${answer}` }
        ];

        const aiResponse = await askAi(messages);
        const parsed = JSON.parse(aiResponse);

        Object.assign(question, { answer, confidence: parsed.confidence, communication: parsed.communication, correctness: parsed.correctness, score: parsed.finalScore, feedback: parsed.feedback });

        await interview.save();
        res.json({ feedback: parsed.feedback });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const finishInterview = async (req, res) => {
    try {
        const { interviewId } = req.body;
        const interview = await Interview.findById(interviewId);
        const total = interview.questions.length;
        let s = 0, conf = 0, comm = 0, corr = 0;

        interview.questions.forEach(q => { s += q.score; conf += q.confidence; comm += q.communication; corr += q.correctness; });
        interview.finalScore = s / total;
        interview.status = "completed";
        await interview.save();

        const user = await User.findById(interview.userId); // ← yeh hai?


        // res.json({ finalScore: interview.finalScore, confidence: conf / total, communication: comm / total, correctness: corr / total, questionWiseScore: interview.questions });
        res.json({
    userName: user?.name || "Candidate",
    userEmail: user?.email || "N/A",
    role: interview.role,
    experience: interview.experience,
    createdAt: interview.createdAt,
    finalScore: Number((s / total).toFixed(1)),
    confidence: Number((conf / total).toFixed(1)),
    communication: Number((comm / total).toFixed(1)),
    correctness: Number((corr / total).toFixed(1)),
    questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
    }))
});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(interviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInterviewReport = async (req, res) => {
    try {
        // CRITICAL UPDATE: populate user details for PDF
        const interview = await Interview.findById(req.params.id).populate("userId", "name email");
        if (!interview) return res.status(404).json({ message: "Not found" });

        const total = interview.questions.length;
        let conf = 0, comm = 0, corr = 0;
        interview.questions.forEach(q => { conf += q.confidence; comm += q.communication; corr += q.correctness; });

        res.json({
            userName: interview.userId?.name || "Candidate",
            userEmail: interview.userId?.email || "N/A",
            role: interview.role,
            experience: interview.experience,
            createdAt: interview.createdAt,
            finalScore: interview.finalScore,
            confidence: Number((conf / total).toFixed(1)),
            communication: Number((comm / total).toFixed(1)),
            correctness: Number((corr / total).toFixed(1)),
            questionWiseScore: interview.questions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
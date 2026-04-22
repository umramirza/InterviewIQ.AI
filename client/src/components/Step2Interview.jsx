import React, { useEffect, useRef, useState } from "react";
import maleVideo from "../assets/Videos/male-ai.mp4";
import femaleVideo from "../assets/Videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App";
import { BsArrowRight } from "react-icons/bs";

function Step2Interview({ interviewData, onFinish }) {
    const { interviewId, questions, userName, } = interviewData;
    const [isIntrophase, setIsIntroPhase] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isAIPlaying, setIsAIPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voiceGender, setVoiceGender] = useState("female");
    const [subtitle, setSubtitle] = useState("");

    const recognitionRef = useRef(null);
    const videoRef = useRef(null);
    const currentQuestion = questions[currentIndex];

    // 1. Voice Setup
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (!voices.length) return;
            const femaleVoice = voices.find(v => v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("female"));
            if (femaleVoice) { setSelectedVoice(femaleVoice); setVoiceGender("female"); }
            else {
                const maleVoice = voices.find(v => v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("mark"));
                setSelectedVoice(maleVoice || voices[0]);
                setVoiceGender(maleVoice ? "male" : "female");
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

    // 2. Mic Logic
    const startMic = () => {
        if (recognitionRef.current && !isAIPlaying && !feedback && timeLeft > 0) {
            try { recognitionRef.current.start(); } catch (e) { }
        }
    };

    const stopMic = () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
    };

    const toggleMic = () => {
        isMicOn ? stopMic() : startMic();
        setIsMicOn(!isMicOn);
    };

    // 3. Speech Recognition
    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) return;
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
            }
            if (finalTranscript) setAnswer((prev) => (prev + " " + finalTranscript).trim());
        };

        recognition.onend = () => {
            if (isMicOn && !isAIPlaying && !isSubmitting && !feedback && timeLeft > 0) {
                try { recognition.start(); } catch (e) { }
            }
        };
        recognitionRef.current = recognition;
    }, [isMicOn, isAIPlaying, isSubmitting, feedback, timeLeft]);

    // 4. Speak Logic
    const speakText = (text) => {
        return new Promise((resolve) => {
            if (!window.speechSynthesis || !selectedVoice) { resolve(); return; }
            window.speechSynthesis.cancel();
            setSubtitle(text);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = selectedVoice;
            utterance.onstart = () => {
                setIsAIPlaying(true);
                stopMic();
                videoRef.current?.play().catch(() => { });
            };
            utterance.onend = () => {
                videoRef.current?.pause();
                if (videoRef.current) videoRef.current.currentTime = 0;
                setIsAIPlaying(false);
                setSubtitle("");
                if (isMicOn && !feedback && timeLeft > 0) setTimeout(() => startMic(), 600);
                resolve();
            };
            window.speechSynthesis.speak(utterance);
        });
    };

    // 5. Submit Logic (With Alert & Logic Fix)
    const submitAnswer = async () => {
        if (isSubmitting) return;

        // ALERT LOGIC: Agar answer khali hai aur time bacha hai
        if (!answer.trim() && timeLeft > 0) {
            alert("Please speak or type something before submitting.");
            return;
        }

        setIsSubmitting(true);
        stopMic();

        try {
            const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
                interviewId,
                questionIndex: currentIndex,
                answer: answer.trim() || "No response provided.",
                timeTaken: (currentQuestion.timeLimit || 60) - timeLeft
            }, { withCredentials: true });

            setFeedback(result.data.feedback);
            await speakText(result.data.feedback);
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false); // Evaluate fix
        }
    };

    // 6. Navigation
    const handleNext = async () => {
        setIsSubmitting(false);
        setAnswer("");
        setFeedback("");
        if (currentIndex + 1 >= questions.length) {
            stopMic();
            try {
                const result = await axios.post(ServerUrl + "/api/interview/finish", { interviewId }, { withCredentials: true });
                console.log("FINISH RESPONSE:", result.data);

                onFinish(result.data);
            } catch (e) { console.log(e); }
            return;
        }
        await speakText("Alright, lets move to the next question.");
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(questions[currentIndex + 1]?.timeLimit || 60);
    };

    // 7. Timer
    useEffect(() => {
        if (isIntrophase || feedback || isSubmitting) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    stopMic();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isIntrophase, currentIndex, feedback, isSubmitting]);

    // 8. Intro Flow
    useEffect(() => {
        if (!selectedVoice) return;
        const runIntro = async () => {
            if (isIntrophase) {
                await speakText(`Hi ${userName}, it's great to meet you today. I hope you're ready.`);
                await speakText("I'll ask you a few questions. Just answer naturally. Let's begin.");
                setIsIntroPhase(false);
            } else if (currentQuestion && !feedback) {
                await new Promise(r => setTimeout(r, 600));
                await speakText(currentQuestion.question);
            }
        };
        runIntro();
    }, [selectedVoice, isIntrophase, currentIndex]);

    return (
        <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">

                {/* VIDEO SECTION */}
                <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">
                    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
                        <video src={videoSource} key={videoSource} ref={videoRef} muted playsInline preload="auto" className="w-full h-auto object-cover" />
                    </div>

                    {subtitle && (
                        <div className="w-full max-w-md bg-gray-50 border border-gray-20 rounded-xl p-4 shadow-sm text-center">
                            <p className="text-gray-700 text-sm sm:text-base font-medium italic">"{subtitle}"</p>
                        </div>
                    )}

                    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Status</span>
                            <span className={`font-semibold ${isAIPlaying ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {isAIPlaying ? "AI Speaking" : "Listening..."}
                            </span>
                        </div>
                        <div className="h-px bg-gray-200"></div>
                        <div className="flex justify-center">
                            <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
                        </div>
                        <div className="h-px bg-gray-200"></div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div>
                                <span className="text-2xl font-bold text-emerald-600">{currentIndex + 1}</span>
                                <span className="text-xs text-gray-400 block font-bold uppercase tracking-tighter">Current Question</span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-emerald-600">{questions.length}</span>
                                <span className="text-xs text-gray-400 block font-bold uppercase tracking-tighter">Total Questions</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TEXT SECTION */}
                <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">
                    <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6  tracking-wider">AI Smart Interview</h2>

                    {!isIntrophase && (
                        <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
                            {/* Question X of Y updated */}
                            <p className="text-xs sm:text-sm text-gray-400 mb-2 font-bold uppercase tracking-wide">
                                Question {currentIndex + 1} of {questions.length}
                            </p>
                            <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">{currentQuestion?.question}</div>
                        </div>
                    )}

                    <textarea
                        placeholder="Your transcribed answer will appear here..."
                        onChange={(e) => setAnswer(e.target.value)}
                        value={answer}
                        disabled={!!feedback || isSubmitting || timeLeft === 0}
                        className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 text-gray-800 disabled:opacity-50 text-lg transition-all"
                    />

                    {timeLeft === 0 && !feedback && !isSubmitting && (
                        <p className="text-red-500 text-xs mt-2 font-bold animate-pulse tracking-tight uppercase">
                            Time's Up! Please submit your answer.
                        </p>
                    )}

                    {!feedback ? (
                        <div className="flex items-center gap-4 mt-6">
                            <motion.button
                                onClick={toggleMic}
                                disabled={timeLeft === 0}
                                whileTap={{ scale: 0.9 }}
                                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-white shadow-lg transition-colors
                                    ${(isAIPlaying || !isMicOn || timeLeft === 0) ? 'bg-red-500' : 'bg-black'}`}>
                                {(isAIPlaying || !isMicOn) ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
                            </motion.button>
                            <motion.button
                                onClick={submitAnswer}
                                // Button ko kabhi disable nahi karenge taaki click karne par alert aa sake (jab time ho)
                                disabled={isSubmitting}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg font-bold disabled:bg-gray-400 uppercase tracking-widest transition-all">
                                {isSubmitting ? "Evaluating..." : "Submit Answer"}
                            </motion.button>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm">
                            <p className="text-emerald-700 font-medium mb-4 italic leading-relaxed">"{feedback}"</p>
                            <button onClick={handleNext} className="w-full bg-black text-white py-3 rounded-xl shadow-md flex items-center justify-center gap-1 hover:bg-gray-800 transition-all font-bold">
                                Next Question <BsArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Step2Interview;
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
    const { interviewId, questions, userName } = interviewData;

    const [isIntrophase, setIsIntroPhase] = useState(true);
    const [isMicOn, setIsMicOn] = useState(false); 
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

    // Refs — real time values for async callbacks
    const isAIPlayingRef = useRef(false);
    const isMicOnRef = useRef(false);
    const isListeningRef = useRef(false);
    const feedbackRef = useRef("");
    const timeLeftRef = useRef(questions[0]?.timeLimit || 60);

    const currentQuestion = questions[currentIndex];

    // Sync refs
    useEffect(() => { isAIPlayingRef.current = isAIPlaying; }, [isAIPlaying]);
    useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);
    useEffect(() => { feedbackRef.current = feedback; }, [feedback]);
    useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

    // ─── 1. Voice Setup ───────────────────────────────────────────
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (!voices.length) return;
            const female = voices.find(v =>
                v.name.toLowerCase().includes("zira") ||
                v.name.toLowerCase().includes("samantha") ||
                v.name.toLowerCase().includes("female")
            );
            if (female) {
                setSelectedVoice(female);
                setVoiceGender("female");
            } else {
                const male = voices.find(v =>
                    v.name.toLowerCase().includes("david") ||
                    v.name.toLowerCase().includes("mark")
                );
                setSelectedVoice(male || voices[0]);
                setVoiceGender(male ? "male" : "female");
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

    // ─── 2. Recognition Setup ──────────────────────────
    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) return;

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;  
        recognition.interimResults = false; 

        recognition.onresult = (event) => {
            if (isAIPlayingRef.current) return;
            if (!isMicOnRef.current) return;

            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript + " ";
                }
            }

            const clean = transcript.trim();
            if (clean) {
                setAnswer(prev => (prev ? prev + " " + clean : clean));
            }
        };

        recognition.onend = () => {
            isListeningRef.current = false;
            if (
                isMicOnRef.current &&
                !isAIPlayingRef.current &&
                !feedbackRef.current &&
                timeLeftRef.current > 0
            ) {
                setTimeout(() => {
                    if (
                        isMicOnRef.current &&
                        !isAIPlayingRef.current &&
                        !isListeningRef.current &&
                        recognitionRef.current
                    ) {
                        try {
                            recognitionRef.current.start();
                            isListeningRef.current = true;
                        } catch (e) {}
                    }
                }, 300);
            }
        };

        recognition.onerror = (e) => {
            isListeningRef.current = false;
            if (e.error === "no-speech" || e.error === "aborted") return;
            console.log("Mic error:", e.error);
        };

        recognitionRef.current = recognition;

        return () => {
            try { recognition.stop(); } catch (e) {}
        };
    }, []); 

    // ─── 3. Mic start/stop helpers ────────────────────────────────
    const startMic = () => {
        if (
            !recognitionRef.current ||
            isAIPlayingRef.current ||
            isListeningRef.current ||
            !isMicOnRef.current ||
            timeLeftRef.current <= 0
        ) return;

        try {
            recognitionRef.current.start();
            isListeningRef.current = true;
        } catch (e) {}
    };

    const stopMic = () => {
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.stop();
        } catch (e) {}
        isListeningRef.current = false;
    };

    // ─── 4. Toggle mic button ─────────────────────────────────────
    const toggleMic = () => {
        if (isAIPlaying) return; 

        if (isMicOn) {
            // Turn OFF
            isMicOnRef.current = false;
            setIsMicOn(false);
            stopMic();
        } else {
            // Turn ON
            isMicOnRef.current = true;
            setIsMicOn(true);
            setTimeout(() => startMic(), 200);
        }
    };

    // ─── 5. Speak — 
    const speakText = (text) => {
        return new Promise((resolve) => {
            if (!window.speechSynthesis || !selectedVoice) {
                resolve();
                return;
            }

            
            stopMic();
            window.speechSynthesis.cancel();

            setSubtitle(text);

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = selectedVoice;
            utterance.rate = 0.95;

            utterance.onstart = () => {
                isAIPlayingRef.current = true;
                setIsAIPlaying(true);
                stopMic(); // double ensure
                videoRef.current?.play().catch(() => {});
            };

            utterance.onend = () => {
                isAIPlayingRef.current = false;
                setIsAIPlaying(false);
                setSubtitle("");
                videoRef.current?.pause();
                if (videoRef.current) videoRef.current.currentTime = 0;

                
                setTimeout(() => {
                    if (
                        isMicOnRef.current &&
                        !feedbackRef.current &&
                        timeLeftRef.current > 0
                    ) {
                        startMic();
                    }
                }, 800);

                resolve();
            };

            utterance.onerror = () => {
                isAIPlayingRef.current = false;
                setIsAIPlaying(false);
                resolve();
            };

            window.speechSynthesis.speak(utterance);
        });
    };

    // ─── 6. Submit Answer ─────────────────────────────────────────
    const submitAnswer = async () => {
        if (isSubmitting) return;

        if (!answer.trim() && timeLeft > 0) {
            alert("Please speak or type something before submitting.");
            return;
        }

        setIsSubmitting(true);
        stopMic();
        isMicOnRef.current = false;
        setIsMicOn(false);

        try {
            const result = await axios.post(
                ServerUrl + "/api/interview/submit-answer",
                {
                    interviewId,
                    questionIndex: currentIndex,
                    answer: answer.trim() || "No response provided.",
                    timeTaken: (currentQuestion.timeLimit || 60) - timeLeft
                },
                { withCredentials: true }
            );

            feedbackRef.current = result.data.feedback;
            setFeedback(result.data.feedback);
            await speakText(result.data.feedback);
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── 7. Next Question ─────────────────────────────────────────
    const handleNext = async () => {
        stopMic();
        feedbackRef.current = "";
        setFeedback("");
        setAnswer("");
        setIsSubmitting(false);
        isMicOnRef.current = false;
        setIsMicOn(false); 

        if (currentIndex + 1 >= questions.length) {
            try {
                const result = await axios.post(
                    ServerUrl + "/api/interview/finish",
                    { interviewId },
                    { withCredentials: true }
                );
                onFinish(result.data);
            } catch (e) {
                console.log(e);
            }
            return;
        }

        const nextIndex = currentIndex + 1;
        setTimeLeft(questions[nextIndex]?.timeLimit || 60);
        timeLeftRef.current = questions[nextIndex]?.timeLimit || 60;
        setCurrentIndex(nextIndex);

        await speakText("Alright, let's move to the next question.");
    };

    // ─── 8. Timer ─────────────────────────────────────────────────
    useEffect(() => {
        if (isIntrophase || feedback || isSubmitting) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const next = prev - 1;
                timeLeftRef.current = next;
                if (next <= 0) {
                    clearInterval(timer);
                    stopMic();
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isIntrophase, currentIndex, feedback, isSubmitting]);

    // ─── 9. Intro + Question Flow ─────────────────────────────────
    useEffect(() => {
        if (!selectedVoice) return;

        const run = async () => {
            if (isIntrophase) {
                await speakText(`Hi ${userName}, it's great to meet you today. I hope you're ready.`);
                await speakText("I'll ask you a few questions. Just answer naturally. Let's begin.");
                setIsIntroPhase(false);
            } else if (currentQuestion && !feedbackRef.current) {
                await new Promise(r => setTimeout(r, 500));
                await speakText(currentQuestion.question);
            }
        };

        run();
    }, [selectedVoice, isIntrophase, currentIndex]);

    // ─── UI ───────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">

                {/* VIDEO SECTION */}
                <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">
                    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
                        <video
                            src={videoSource}
                            key={videoSource}
                            ref={videoRef}
                            muted
                            playsInline
                            preload="auto"
                            className="w-full h-auto object-cover"
                        />
                    </div>

                    {subtitle && (
                        <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                            <p className="text-gray-700 text-sm sm:text-base font-medium italic">"{subtitle}"</p>
                        </div>
                    )}

                    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Status</span>
                            <span className={`font-semibold ${isAIPlaying ? "text-emerald-600" : isMicOn ? "text-blue-500" : "text-gray-400"}`}>
                                {isAIPlaying ? "AI Speaking" : isMicOn ? "Listening..." : "Mic Off"}
                            </span>
                        </div>
                        <div className="h-px bg-gray-200" />
                        <div className="flex justify-center">
                            <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
                        </div>
                        <div className="h-px bg-gray-200" />
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div>
                                <span className="text-2xl font-bold text-emerald-600">{currentIndex + 1}</span>
                                <span className="text-xs text-gray-400 block font-bold uppercase tracking-tighter">Current</span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-emerald-600">{questions.length}</span>
                                <span className="text-xs text-gray-400 block font-bold uppercase tracking-tighter">Total</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TEXT SECTION */}
                <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6 tracking-wider">AI Smart Interview</h2>

                    {!isIntrophase && (
                        <div className="mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <p className="text-xs sm:text-sm text-gray-400 mb-2 font-bold uppercase tracking-wide">
                                Question {currentIndex + 1} of {questions.length}
                            </p>
                            <p className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                                {currentQuestion?.question}
                            </p>
                        </div>
                    )}

                    <textarea
                        placeholder="Your answer will appear here as you speak..."
                        onChange={(e) => setAnswer(e.target.value)}
                        value={answer}
                        disabled={!!feedback || isSubmitting || timeLeft === 0}
                        className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 text-gray-800 disabled:opacity-50 text-lg transition-all"
                    />

                    {timeLeft === 0 && !feedback && !isSubmitting && (
                        <p className="text-red-500 text-xs mt-2 font-bold animate-pulse uppercase">
                            Time's Up! Please submit your answer.
                        </p>
                    )}

                    {!feedback ? (
                        <div className="flex items-center gap-4 mt-6">
                            {/* MIC BUTTON */}
                            <motion.button
                                onClick={toggleMic}
                                disabled={isAIPlaying || timeLeft === 0}
                                whileTap={{ scale: 0.9 }}
                                title={isMicOn ? "Click to mute" : "Click to speak"}
                                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-white shadow-lg transition-all
                                    ${isAIPlaying || timeLeft === 0
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : isMicOn
                                            ? "bg-black"       // mic ON — black
                                            : "bg-red-500"     // mic OFF — red
                                    }`}>
                                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                            </motion.button>

                            {/* SUBMIT BUTTON */}
                            <motion.button
                                onClick={submitAnswer}
                                disabled={isSubmitting}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg font-bold disabled:opacity-50 uppercase tracking-widest transition-all">
                                {isSubmitting ? "Evaluating..." : "Submit Answer"}
                            </motion.button>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm">
                            <p className="text-emerald-700 font-medium mb-4 italic leading-relaxed">"{feedback}"</p>
                            <button
                                onClick={handleNext}
                                className="w-full bg-black text-white py-3 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-gray-800 transition-all font-bold">
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

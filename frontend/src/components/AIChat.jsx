import React, { useState } from "react";
import axios from "axios";
import { FaCommentDots } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "Hello 💙 I’m here to support you with care and understanding. How are you feeling right now?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages(prev => [...prev, userMessage]);

        const token = localStorage.getItem("token");
        setInput("");

        setIsTyping(true); // AI po shkruan...

        try {
            const response = await axios.post(
                "http://localhost:8000/api/ai/chat",
                { message: userMessage.text },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiReply = response.data.reply;

            setMessages(prev => [...prev, { sender: "ai", text: aiReply }]);
        } catch (error) {
            setMessages(prev => [
                ...prev,
                { sender: "ai", text: "I'm having trouble responding right now 💛" }
            ]);
        }

        setIsTyping(false);
    };

    return (
        <>
            {/* Floating Button */}
            <div
                onClick={() => setIsOpen(true)}
                style={{
                    position: "fixed",
                    bottom: "28px",
                    right: "28px",
                    background: "linear-gradient(135deg, #006AFF, #1A7CFF)",
                    width: "65px",
                    height: "65px",
                    borderRadius: "50%",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
                    display: isOpen ? "none" : "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 9999,
                    transition: "0.25s",
                    animation: "pulse 2s infinite"
                }}
            >
                <FaCommentDots size={30} color="white" />
            </div>

            {/* Keyframes animation */}
            <style>
                {`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                    100% { transform: scale(1); }
                }
                `}
            </style>

            {/* Chat Window */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "28px",
                        right: "28px",
                        width: "420px",
                        height: "530px",
                        background: "white",
                        borderRadius: "20px",
                        boxShadow: "0 8px 22px rgba(0,0,0,0.20)",
                        zIndex: 9999,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: "linear-gradient(to right, #305db1ff)",
                            padding: "15px",
                            color: "white",
                            fontWeight: "bold",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "1rem"
                        }}
                    >
                        <span>AI Support</span>
                        <IoClose
                            size={24}
                            style={{ cursor: "pointer" }}
                            onClick={() => setIsOpen(false)}
                        />
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            padding: "14px",
                            overflowY: "auto",
                            background: "#f4f6fb",
                        }}
                    >
                        {messages.map((msg, idx) => (

                            <div
                                key={idx}
                                style={{
                                    textAlign: msg.sender === "user" ? "right" : "left",
                                    marginBottom: "12px",
                                }}
                            >
                                <span
                                    style={{
                                        display: "inline-block",
                                        padding: "10px 14px",
                                        borderRadius: "16px",
                                        maxWidth: "80%",
                                        background:
                                            msg.sender === "user"
                                                ? "#d8eaff"
                                                : "#ebe4ff",
                                        color: "#333",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    {msg.text}
                                </span>
                            </div>
                        ))}

                        {/* 👇 SHTO KËTUUUU! */}
                        {isTyping && (
                            <div
                                style={{
                                    textAlign: "left",
                                    marginBottom: "12px",
                                    opacity: 0.7,
                                }}
                            >
                                <span
                                    style={{
                                        display: "inline-block",
                                        padding: "10px 14px",
                                        borderRadius: "16px",
                                        maxWidth: "80%",
                                        background: "#ebe4ff",
                                        color: "#555",
                                        fontStyle: "italic",
                                    }}
                                >
                                    AI is typing…
                                </span>
                            </div>
                        )}

                    </div>

                    {/* Input Bar */}
                    <div
                        style={{
                            padding: "12px",
                            display: "flex",
                            gap: "6px",
                            background: "white",
                            borderTop: "1px solid #eee"
                        }}
                    >
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button
                            className="btn btn-primary"
                            style={{ background: "#305db1ff", border: "none" }}
                            onClick={sendMessage}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChat;

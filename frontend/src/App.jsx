import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

const socket = io("https://letscode-2fyu.onrender.com");

const userNames = ["Keshav", "Rishav", "Gaurav", "Shubham"];

function App() {
  const [question, setQuestion] = useState("");
  const [codes, setCodes] = useState(() =>
    userNames.reduce((acc, name) => ({ ...acc, [name]: "" }), {})
  );
  const [fullscreen, setFullscreen] = useState(null);

  const lastSentRef = useRef({}); // Track last emitted code for each user

  // --- SOCKET EVENTS ---
  useEffect(() => {
    socket.on("init", ({ question: q, codes: c }) => {
      setQuestion(q);
      setCodes(c);
    });

    socket.on("questionUpdated", (q) => {
      setQuestion(q);
    });

    socket.on("codeUpdated", ({ user, code }) => {
      // Avoid overwriting local user's code with echo from server
      if (lastSentRef.current[user] === code) return;

      setCodes((prev) => ({
        ...prev,
        [user]: code,
      }));
    });

    return () => {
      socket.off("init");
      socket.off("questionUpdated");
      socket.off("codeUpdated");
    };
  }, []);

  // --- HANDLERS ---
  const handleQuestionChange = (e) => {
    const q = e.target.value;
    setQuestion(q);
    socket.emit("updateQuestion", q);
  };

  const handleCodeChange = (user, value) => {
    setCodes((prev) => ({ ...prev, [user]: value }));
    lastSentRef.current[user] = value; // Remember what we just sent
    socket.emit("submitCode", { user, code: value });
  };

  // --- UI ---
  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col p-4">
      {/* Question Section */}
      <div className="mb-4 flex flex-col">
        <label className="font-bold text-lg mb-2">Question:</label>
        <textarea
          value={question}
          onChange={handleQuestionChange}
          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 resize-none overflow-auto"
          placeholder="Type your question here..."
          rows={Math.min(Math.max(question.split("\n").length, 3), 10)}
        />
      </div>

      {/* Code Editors */}
      <div
        className={`flex-1 grid ${
          fullscreen ? "grid-cols-1 grid-rows-1" : "grid-rows-2 grid-cols-2"
        } gap-4`}
      >
        {userNames.map((user) => (
          <div
            key={user}
            className={`flex flex-col bg-gray-800 rounded-xl overflow-hidden shadow-lg ${
              fullscreen === user
                ? "absolute top-0 left-0 w-screen h-screen z-50 p-4"
                : ""
            }`}
          >
            <div className="bg-gray-700 p-2 flex justify-between items-center">
              <span className="font-semibold">{user}</span>
              <button
                onClick={() =>
                  setFullscreen(fullscreen === user ? null : user)
                }
                className="text-sm text-green-400 font-bold"
              >
                {fullscreen === user ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </div>

            <CodeMirror
              value={codes[user]}
              height="100%"
              theme="dark"
              extensions={[javascript()]}
              onChange={(value) => handleCodeChange(user, value)}
              className="flex-1 overflow-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

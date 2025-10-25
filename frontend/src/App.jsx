import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

const socket = io("https://letscode-2fyu.onrender.com");

const userNames = ["Keshav", "Rishav", "Gaurav", "Shubham"];

function App() {
  const [question, setQuestion] = useState("");
  const [codes, setCodes] = useState(
    userNames.reduce((acc, name) => ({ ...acc, [name]: "" }), {})
  );
  const [fullscreen, setFullscreen] = useState(null);
  const lastSentRef = useRef({});

  useEffect(() => {
    socket.on("init", ({ question: q, codes: c }) => {
      setQuestion(q);
      setCodes(c);
    });

    socket.on("questionUpdated", (q) => setQuestion(q));

    socket.on("codeUpdated", ({ user, code }) => {
      if (lastSentRef.current[user] === code) return;
      setCodes((prev) => ({ ...prev, [user]: code }));
    });

    return () => {
      socket.off("init");
      socket.off("questionUpdated");
      socket.off("codeUpdated");
    };
  }, []);

  const handleQuestionChange = (e) => {
    const q = e.target.value;
    setQuestion(q);
    socket.emit("updateQuestion", q);
  };

  const handleCodeChange = (user, value) => {
    setCodes((prev) => ({ ...prev, [user]: value }));
    lastSentRef.current[user] = value;
    socket.emit("submitCode", { user, code: value });
  };

  // Each editor height in normal grid (half of remaining screen)
  const editorHeight = "calc((100vh - 160px)/2)"; // adjust 160px for question box + padding

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col p-4 overflow-hidden">
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

      {/* 4 Code Editors */}
      <div
        className={`grid ${fullscreen ? "grid-cols-1 grid-rows-1" : "grid-cols-2 grid-rows-2"} gap-4 flex-1`}
      >
        {userNames.map((user) => (
          <div
            key={user}
            className={`flex flex-col bg-gray-800 rounded-xl shadow-lg relative`}
            style={{
              height: fullscreen ? "100vh" : editorHeight,
            }}
          >
            {/* Header */}
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

            {/* Scrollable CodeMirror */}
            <div className="flex-1 overflow-auto">
              <CodeMirror
                value={codes[user]}
                height="100%"
                theme="dark"
                extensions={[javascript()]}
                onChange={(value) => handleCodeChange(user, value)}
                className="h-full overflow-auto text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from "react";

export default function CodeBox({ user, code, socket }) {
  const [localCode, setLocalCode] = useState(code);
  const [editing, setEditing] = useState(false);

  // Update code if changed remotely
  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  const handleSubmit = () => {
    socket.emit("submitCode", { user, code: localCode });
    setEditing(false);
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-4 flex flex-col">
      <div className="flex justify-between mb-2">
        <h2 className="font-semibold">{user}</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-yellow-400"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="text-sm text-green-400"
          >
            Submit
          </button>
        )}
      </div>

      {editing ? (
        <textarea
          className="flex-grow p-2 text-black rounded"
          value={localCode}
          onChange={(e) => setLocalCode(e.target.value)}
        />
      ) : (
        <pre className="flex-grow bg-gray-900 p-2 rounded overflow-auto whitespace-pre-wrap">
          {localCode}
        </pre>
      )}
    </div>
  );
}

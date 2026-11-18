import { useRef, useState } from "react";
import Toggle from "./Toggle.jsx";
import { readGeometryFromFile } from "../scripts/rhinoCompute.js";

import sidebarStyles from "../ui/Sidebar.module.css"; //the outlined button
import matchStyles from "../ui/MatchSummary.module.css";

//lets the user choose between the built-in demo geometry and their own Rhino file
export default function GeometrySource({ accepts, source, onChange }) {
  const [error, setError] = useState(null);
  const fileInput = useRef(null);

  const uploading = source.mode === "upload";

  async function handleFile(event) {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;

    try {
      const geometry = await readGeometryFromFile(file, accepts);
      setError(null);
      const fileId = `${file.name}-${file.size}-${file.lastModified}`;
      onChange({ mode: "upload", fileName: file.name, fileId: fileId, geometry: geometry });
    } catch (readError) {
      setError(readError.message);
    }
  }

  function switchMode(useUpload) {
    setError(null);
    onChange({ ...source, mode: useUpload ? "upload" : "demo" });
  }

  return (
    <div className="setting">
      <Toggle title="useUpload" label="Use my own Rhino file" val={uploading} onUpdate={switchMode} />

      {uploading && (
        <>
          <p className={matchStyles.message}>
            {source.fileName ? `Using ${source.fileName}` : `Choose a valid .3dm file.`}
          </p>
          {error !== null && <p className={matchStyles.error}>{error}</p>}

          <button type="button" className={sidebarStyles.resetButton} onClick={() => fileInput.current.click()}>
            {source.fileName ? "Change file" : "Upload file"}
          </button>
          <input ref={fileInput} type="file" accept=".3dm" hidden onChange={handleFile} />
        </>
      )}
    </div>
  );
}
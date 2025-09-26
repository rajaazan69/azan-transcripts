import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// --- Ensure transcripts folder exists ---
const transcriptsPath = path.join(process.cwd(), "public", "transcripts");
if (!fs.existsSync(transcriptsPath)) {
  fs.mkdirSync(transcriptsPath, { recursive: true });
  console.log("Created public/transcripts folder");
}

// --- Serve static files ---
app.use(express.static("public"));
app.use("/transcripts", express.static(transcriptsPath));

// --- Parse JSON bodies for uploads ---
app.use(express.json({ limit: "10mb" }));

// --- Upload transcript endpoint ---
app.post("/api/upload-transcript", (req, res) => {
  try {
    const { filename, content } = req.body;
    if (!filename || !content) return res.status(400).json({ error: "Missing filename or content" });

    const safeName = path.basename(filename);
    const filePath = path.join(transcriptsPath, safeName);

    fs.writeFileSync(filePath, content, "utf-8");
    return res.json({ success: true, url: `/transcripts/${safeName}` });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// --- Health check ---
app.get("/", (req, res) => res.send("Transcripts server is running."));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
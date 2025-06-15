import React, { useRef, useState } from "react";
import { UploadCloud, Loader2, Image as ImageIcon, Search } from "lucide-react";
import Tesseract from "tesseract.js";

const pageConfig = {
  title: "🚩 Red Flag Detector",
  slug: "red-flag-detector",
  sections: [
    {
      type: "hero",
      title: "🚩 Is This a Red Flag?",
      subtitle: "Upload a screenshot and we’ll tell you if it’s time to ghost them 👻",
      alignment: "center",
    },
    {
      type: "form",
      id: "upload-form",
      fields: [
        {
          type: "file",
          label: "Your screenshot",
          name: "screenshot",
          accept: ["image/png", "image/jpeg"],
          required: true,
        },
      ],
      submitLabel: "Analyze the Vibes",
      submitStyle: "primary",
      webhook: {
        enabled: true,
        url: "https://hook.eu2.make.com/rxtmx6arxzyrne8zyniivf2uw6apj5kl",
      },
    },
    {
      type: "results",
      id: "result-section",
      initiallyHidden: true,
      elements: [
        { type: "text", id: "result-card" },
        {
          type: "image",
          id: "result-gif",
          showWhen: { field: "result-card", exists: true },
        },
      ],
    },
    {
      type: "footer",
      text: "We’re not therapists, but we try.",
    },
  ],
  theme: {
    colors: {
      primary: "#E63946",
      secondary: "#F1FAEE",
      background: "#FFFFFF",
      text: "#333333",
    },
    fonts: {
      heading: "Inter, sans-serif",
      body: "Inter, sans-serif",
    },
  },
};

const exampleRedFlags = [
  "Gaslighting 😶‍🌫️",
  "Emotional Unavailability 🙃",
  "Guilt-Tripping 😬",
  "Breadcrumbing 🍞",
  "Love Bombing 💣",
  "Future Faking 📅",
  "Benching 🪑",
  "Mystery Texts 🕵️‍♂️",
];
const funnyComments = [
  "Time to ghost 👻 and go get a croissant 🥐",
  "Redder than a lobster at a pool party.",
  "Run, don’t walk, to the nearest exit!",
  "This chat needs an exorcism 🔥",
  "Did someone order a 🚩 parade?",
  "Not even your therapist can fix this.",
  "Just say ‘new phone, who dis?’",
  "You deserve dog pics, not this.",
  "Block button looking extra clickable rn.",
];
const memeGifs = [
  "https://media.giphy.com/media/l2JJKs3I69qfaQleE/giphy.gif",
  "https://media.giphy.com/media/3og0IPxMM0erATueVW/giphy.gif",
  "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
  "https://media.giphy.com/media/12XDYvMJNcmLgQ/giphy.gif",
  "https://media.giphy.com/media/l0MYRzcWP7Jx3FAYY/giphy.gif",
  "https://media.giphy.com/media/ToMjGpx9F5ktZw8qPUQ/giphy.gif",
];
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function fakeAnalyze() {
  return {
    score: Math.floor(Math.random() * 60) + 40,
    type: randomItem(exampleRedFlags),
    comment: randomItem(funnyComments),
    gif: randomItem(memeGifs),
  };
}

const theme = pageConfig.theme;

export default function Home() {
  const [file, setFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultShown, setResultShown] = useState(false);
  const [result, setResult] = useState(null);
  const [webhookReport, setWebhookReport] = useState(null);
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setImagePreviewUrl(URL.createObjectURL(selectedFile));
      setResultShown(false);
    }
  }

  async function handleAnalyze() {
    if (!file && !message.trim()) return;
    setLoading(true);
    let inputValue = "";

    if (file) {
      try {
        const { data } = await Tesseract.recognize(file, "eng");
        if (data.text && data.text.trim().length > 0) {
          inputValue = data.text.trim();
        }
      } catch {}
    }
    if (!inputValue && message.trim()) {
      inputValue = message.trim();
    }

    const webhookUrl = pageConfig.sections.find(
      (section) => section.type === "form" && section.webhook?.enabled
    )?.webhook?.url;

    if (webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: inputValue }),
        });

        const raw = await res.text();
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          console.error("Invalid JSON", raw);
        }

        if (parsed?.score && parsed?.type) {
          setWebhookReport({
            score: parsed.score,
            type: parsed.type,
            advice: parsed.advice,
            meme: parsed.meme,
          });
        } else {
          setResult(fakeAnalyze());
        }
      } catch {
        setResult(fakeAnalyze());
      }
    } else {
      setResult(fakeAnalyze());
    }
    setTimeout(() => {
      setLoading(false);
      setResultShown(true);
    }, 1200);
  }

  return (
    <div style={{ fontFamily: theme.fonts.body }}>
      <h1>{pageConfig.title}</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading}
      />
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/png,image/jpeg"
        disabled={loading}
      />
      <button onClick={handleAnalyze} disabled={loading}>
        Analyze
      </button>
      {resultShown && result && <div>{result.type}</div>}
      {webhookReport && <div>{webhookReport.type}</div>}
    </div>
  );
}

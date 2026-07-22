import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TranslateModalProps {
  commentId: string;
  onTranslate: (targetLang: string) => void;
  onClose: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "no", name: "Norwegian" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "el", name: "Greek" },
  { code: "cs", name: "Czech" },
  { code: "hu", name: "Hungarian" },
  { code: "ro", name: "Romanian" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "id", name: "Indonesian" },
];

export default function TranslateModal({
  commentId,
  onTranslate,
  onClose,
}: TranslateModalProps) {
  const [selectedLang, setSelectedLang] = useState("en");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    try {
      await onTranslate(selectedLang);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Translate Comment</h2>
          <button
            onClick={onClose}
            className="rounded hover:bg-secondary"
            title="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Select a language to translate this comment to:
        </p>

        <div className="mt-4 max-h-60 overflow-y-auto rounded border border-input bg-secondary/30 p-2">
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`rounded px-3 py-2 text-left text-sm font-medium transition-colors ${
                  selectedLang === lang.code
                    ? "bg-blue-600 text-white"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleTranslate}
            disabled={loading}
          >
            {loading ? "Translating..." : "Translate"}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "persuasive", label: "Persuasive" },
];

function CreateTemplate() {
  const navigate = useNavigate();
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    content: "",
    channel: "email",
    isAiGenerated: false,
    aiPrompt: "",
    tone: "professional",
  });

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      alert("Describe what message you want the AI to write.");
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post("/templates/generate", {
        prompt: aiPrompt,
        channel: form.channel,
        tone: form.tone ?? "professional",
      });

      setForm({
        name: res.data.name,
        content: res.data.content,
        channel: res.data.channel,
        isAiGenerated: true,
        aiPrompt: aiPrompt.trim(),
        tone: form.tone,
      });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string } } })
        ?.response?.data;
      alert(data?.error ?? "AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/templates", {
        name: form.name,
        content: form.content,
        channel: form.channel,
        isAiGenerated: form.isAiGenerated,
        aiPrompt: form.aiPrompt || undefined,
      });
      navigate("/");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string } } })
        ?.response?.data;
      alert(data?.error ?? "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Message Template</h1>
        <p className="text-slate-500 mt-1 font-medium">
          Draft a message template manually or use our built-in Gemini AI to write custom templates tailored to your tone and channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/AI Card Column */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col justify-between border border-slate-800 relative overflow-hidden">
          {/* Subtle background radial light glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
              </span>
              <h2 className="text-lg font-bold text-slate-100">AI Draft Builder</h2>
            </div>
            
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Provide a brief instruction, select a communication channel & tone, and let Google Gemini draft a structured template.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Channel</label>
                <select
                  className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm font-semibold outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all"
                  value={form.channel}
                  onChange={(e) =>
                    setForm({ ...form, channel: e.target.value })
                  }
                >
                  <option value="email">📧 Email Notification</option>
                  <option value="telegram">✈️ Telegram Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Voice Tone</label>
                <select
                  className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm font-semibold outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all"
                  value={form.tone ?? "professional"}
                  onChange={(e) =>
                    setForm({ ...form, tone: e.target.value })
                  }
                >
                  {TONES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} Tone
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Prompt Description</label>
                <textarea
                  placeholder="e.g. Weekly reminder for team standup every Monday, include meeting link placeholder"
                  className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all min-h-[100px] placeholder-slate-500 font-medium"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-brand-gold hover:bg-brand-gold-hover text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent"></div>
                  Generating Draft...
                </>
              ) : (
                <>✨ Generate Draft with AI</>
              )}
            </button>
          </div>
        </div>

        {/* Right/Manual Edit Column */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {form.isAiGenerated ? "⚡ Review AI Draft" : "📝 Template Details"}
              </h2>
              {form.isAiGenerated && (
                <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-amber-500/10 text-brand-gold border border-amber-500/20">
                  AI-GENERATED DRAFT
                </span>
              )}
            </div>

            {form.isAiGenerated && (
              <p className="text-xs text-amber-600 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl font-medium">
                The content below was dynamically drafted. Feel free to refine the template fields before saving.
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter a descriptive template title"
                  className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-slate-900 transition-all text-slate-900 placeholder-slate-400"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Message Body</label>
                <textarea
                  required
                  placeholder="Write your template message body here..."
                  className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-slate-900 transition-all text-slate-900 placeholder-slate-400 min-h-[160px] leading-relaxed"
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Default Delivery Channel</label>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-slate-900 transition-all text-slate-900"
                  value={form.channel}
                  onChange={(e) =>
                    setForm({ ...form, channel: e.target.value })
                  }
                >
                  <option value="email">Email</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100/60 mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-5 py-3 font-semibold text-sm rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving Template..." : "Save Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTemplate;

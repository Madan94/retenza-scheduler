import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Template {
  id: string;
  name: string;
  channel: string;
}

const PRESET_OPTIONS = [
  { value: "hourly", label: "Every hour" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
  { value: "custom", label: "Custom interval" },
] as const;

function CreateSchedule() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    templateId: "",
    recipient: "",
    scheduledAt: "",
    recurring: false,
    recurrenceInterval: "daily",
    recurrenceValue: 30,
    recurrenceUnit: "minutes",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get("/templates");
      setTemplates(res.data);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === form.templateId);
  const recipientPlaceholder =
    selectedTemplate?.channel === "telegram"
      ? "@username or numeric chat ID"
      : selectedTemplate?.channel === "email"
        ? "customer.email@domain.com"
        : "Recipient contact info";

  const isFrequentRecurring =
    form.recurring &&
    (form.recurrenceInterval === "hourly" ||
      (form.recurrenceInterval === "custom" &&
        ((form.recurrenceUnit === "minutes" && form.recurrenceValue < 5) ||
          (form.recurrenceUnit === "hours" && form.recurrenceValue < 1))));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isFrequentRecurring) {
      const ok = confirm(
        "This schedule will send repeatedly (every few minutes or more often). Continue?"
      );
      if (!ok) return;
    }

    setSubmitting(true);

    const payload = {
      templateId: form.templateId,
      recipient: form.recipient,
      scheduledAt: form.scheduledAt,
      recurring: form.recurring,
      recurrenceInterval: form.recurring ? form.recurrenceInterval : undefined,
      recurrenceValue:
        form.recurring && form.recurrenceInterval === "custom"
          ? form.recurrenceValue
          : undefined,
      recurrenceUnit:
        form.recurring && form.recurrenceInterval === "custom"
          ? form.recurrenceUnit
          : undefined,
    };

    try {
      await api.post("/schedules", payload);
      navigate("/");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string } } })
        ?.response?.data;
      alert(data?.error ?? "Failed to create schedule");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Schedule New Message</h1>
        <p className="text-slate-500 mt-1 font-medium">
          Deploy an automated notification schedule to your customers across specific communication channels.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-100 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6"
      >
        {/* Template Select */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Template</label>
          <select
            required
            className="w-full p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-slate-900 transition-all text-slate-900"
            value={form.templateId}
            onChange={(e) =>
              setForm({ ...form, templateId: e.target.value })
            }
          >
            <option value="">Select a pre-designed template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.channel})
              </option>
            ))}
          </select>
        </div>

        {/* Recipient Input */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recipient Details</label>
          <input
            type="text"
            required
            placeholder={recipientPlaceholder}
            className="w-full p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-slate-900 transition-all text-slate-900 placeholder-slate-400"
            value={form.recipient}
            onChange={(e) =>
              setForm({ ...form, recipient: e.target.value })
            }
          />
          {selectedTemplate?.channel === "telegram" && (
            <p className="text-xs text-sky-600 bg-sky-500/5 border border-sky-500/10 p-3.5 rounded-xl font-medium mt-2 leading-relaxed">
              💡 **Telegram Instruction**: Use a starting `@` username or numeric chat ID. Make sure the user has started a conversation with your bot first (search the bot and click **Start**).
            </p>
          )}
        </div>

        {/* Date Time Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Send Time</label>
          <input
            type="datetime-local"
            required
            className="w-full p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-slate-900 transition-all text-slate-900"
            onChange={(e) =>
              setForm({
                ...form,
                scheduledAt: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : "",
              })
            }
          />
        </div>

        {/* Recurring Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <input
              type="checkbox"
              className="w-5 h-5 rounded-lg border-slate-300 text-brand-gold focus:ring-brand-gold accent-slate-900 transition-all cursor-pointer"
              checked={form.recurring}
              onChange={(e) =>
                setForm({ ...form, recurring: e.target.checked })
              }
            />
            <span className="text-sm font-bold text-slate-800 group-hover:text-slate-950 transition-colors">
              Enable Recurring Schedule
            </span>
          </label>
        </div>

        {/* Recurrence Options */}
        {form.recurring && (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Repeat Interval</label>
              <select
                className="w-full p-3.5 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold outline-none focus:border-slate-900 transition-all text-slate-900"
                value={form.recurrenceInterval}
                onChange={(e) =>
                  setForm({
                    ...form,
                    recurrenceInterval: e.target.value,
                  })
                }
              >
                {PRESET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {form.recurrenceInterval === "custom" && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Custom Recurrence Settings</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min={1}
                    max={form.recurrenceUnit === "minutes" ? 10080 : 168}
                    required
                    className="flex-1 p-3.5 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold outline-none focus:border-slate-900 transition-all text-slate-900"
                    value={form.recurrenceValue}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recurrenceValue: Number(e.target.value),
                      })
                    }
                  />
                  <select
                    className="p-3.5 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold outline-none focus:border-slate-900 transition-all text-slate-900"
                    value={form.recurrenceUnit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recurrenceUnit: e.target.value,
                      })
                    }
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-6 border-t border-slate-100/60 flex justify-end gap-3">
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
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Creating Schedule..." : "Activate Schedule"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateSchedule;

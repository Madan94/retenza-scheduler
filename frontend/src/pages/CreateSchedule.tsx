import { useEffect, useState } from "react";
import api from "../services/api";

interface Template {
  id: string;
  name: string;
}

function CreateSchedule() {
  const [templates, setTemplates] = useState<Template[]>([]);

  const [form, setForm] = useState({
    templateId: "",
    recipient: "",
    scheduledAt: "",
    recurring: false,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const res = await api.get("/templates");
    setTemplates(res.data);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    await api.post("/schedules", form);

    alert("Schedule Created");
  };

  return (
    <div className="p-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl bg-slate-800 p-6 rounded-xl"
      >
        <h1 className="text-3xl mb-6">
          Schedule Message
        </h1>

        <select
          className="w-full p-3 mb-4 bg-slate-900 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              templateId: e.target.value,
            })
          }
        >
          <option>
            Select Template
          </option>

          {templates.map((template) => (
            <option
              key={template.id}
              value={template.id}
            >
              {template.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Recipient"
          className="w-full p-3 mb-4 bg-slate-900 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              recipient: e.target.value,
            })
          }
        />

        <input
          type="datetime-local"
          className="w-full p-3 mb-4 bg-slate-900 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              scheduledAt: new Date(
                e.target.value
              ).toISOString(),
            })
          }
        />

        <button
          className="bg-green-600 px-6 py-3 rounded"
        >
          Schedule
        </button>
      </form>
    </div>
  );
}

export default CreateSchedule;
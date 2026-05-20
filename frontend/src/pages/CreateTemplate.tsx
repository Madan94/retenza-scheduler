import { useState } from "react";
import api from "../services/api";

function CreateTemplate() {
  const [form, setForm] = useState({
    name: "",
    content: "",
    channel: "email",
  });

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    await api.post("/templates", form);

    alert("Template Created");
  };

  return (
    <div className="p-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl bg-slate-800 p-6 rounded-xl"
      >
        <h1 className="text-3xl mb-6">
          Create Template
        </h1>

        <input
          type="text"
          placeholder="Template Name"
          className="w-full p-3 mb-4 bg-slate-900 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <textarea
          placeholder="Message Content"
          className="w-full p-3 mb-4 bg-slate-900 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              content: e.target.value,
            })
          }
        />

        <select
          className="w-full p-3 mb-4 bg-slate-900 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              channel: e.target.value,
            })
          }
        >
          <option value="email">
            Email
          </option>

          <option value="telegram">
            Telegram
          </option>
        </select>

        <button
          className="bg-blue-600 px-6 py-3 rounded"
        >
          Create
        </button>
      </form>
    </div>
  );
}

export default CreateTemplate;
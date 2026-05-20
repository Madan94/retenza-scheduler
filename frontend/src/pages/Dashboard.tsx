import { useEffect, useState } from "react";
import api from "../services/api";

interface Template {
  id: string;
  name: string;
  content: string;
  channel: string;
}

interface Schedule {
  id: string;
  recipient: string;
  scheduledAt: string;
  status: string;
}

function Dashboard() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const templatesRes = await api.get("/templates");
    const schedulesRes = await api.get("/schedules");

    setTemplates(templatesRes.data);
    setSchedules(schedulesRes.data);
  };

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-10">
        Retenza Scheduler
      </h1>

      <div className="grid grid-cols-2 gap-8">

        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-2xl mb-4">
            Templates
          </h2>

          {templates.map((template) => (
            <div
              key={template.id}
              className="border border-slate-700 p-4 rounded mb-3"
            >
              <p className="font-bold">
                {template.name}
              </p>

              <p>{template.content}</p>

              <span className="text-sm text-gray-400">
                {template.channel}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-2xl mb-4">
            Scheduled Messages
          </h2>

          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="border border-slate-700 p-4 rounded mb-3"
            >
              <p>{schedule.recipient}</p>

              <p>
                {new Date(
                  schedule.scheduledAt
                ).toLocaleString()}
              </p>

              <span className="text-green-400">
                {schedule.status}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
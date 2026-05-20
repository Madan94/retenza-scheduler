import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CreateTemplate from "./pages/CreateTemplate";
import CreateSchedule from "./pages/CreateSchedule";

function App() {
  return (
    <BrowserRouter>
      <div className="p-5 bg-slate-900 flex gap-6">
        <Link to="/">Dashboard</Link>

        <Link to="/template">
          Create Template
        </Link>

        <Link to="/schedule">
          Schedule Message
        </Link>
      </div>

      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route
          path="/template"
          element={<CreateTemplate />}
        />

        <Route
          path="/schedule"
          element={<CreateSchedule />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
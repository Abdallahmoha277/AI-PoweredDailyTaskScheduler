import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { LanguageProvider } from "./lib/language"
import Landing from "./pages/Landing"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import Calendar from "./pages/Calendar";
import Assistant from "./pages/Assistant";
import Settings from "./pages/Settings";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App

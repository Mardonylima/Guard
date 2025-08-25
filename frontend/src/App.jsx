import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
//import Header from "./components/Header";
import Container from "./components/Container";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import RegisterForm from "./pages/RegisterForm";
import Contacts from "./pages/Contacts";
import ContactForm from "./pages/ContactForm";

export default function App() {
  return (
    <BrowserRouter>
      <Container>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/new" element={<ContactForm />} />
          </Route>
          <Route path="*" element={<p>404 — Página não encontrada</p>} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}
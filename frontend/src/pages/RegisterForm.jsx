// src/pages/RegisterForm.jsx
import { useState } from "react";
import apiClient from "../api/client";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = [];
    if (!form.name) newErrors.push("Nome é obrigatório.");
    if (!form.email.includes("@")) newErrors.push("E-mail inválido.");
    if (form.password.length < 8) newErrors.push("Senha deve ter pelo menos 8 caracteres.");
    if (form.password !== form.confirmPassword) newErrors.push("As senhas não coincidem.");
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await apiClient.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      alert("Conta criada com sucesso!");
      navigate("/login");
    } catch (err) {
      setErrors(["Erro ao criar conta. Tente novamente."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" role="main">
      <section aria-label="Área visual com logo e efeitos visuais" className="left-panel">
        <div className="logo" aria-label="Logo Guard">
          <div className="logo-icon" aria-hidden="true"></div>
          GUARD
        </div>
        <div className="blur-shape blur-left" aria-hidden="true"></div>
        <div className="blur-shape blur-right" aria-hidden="true"></div>
      </section>

      <section className="right-panel" aria-label="Formulário de criação de conta">
        <p className="top-right-text">
          Já tem uma conta?
          <a href="/login" tabIndex="0">Acessar conta</a>
        </p>

        <h1 className="form-title">Criar conta</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Como você se chama?"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Seu e-mail aqui"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Escolha uma senha segura"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Repetir a senha</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Repita sua senha para confirmar"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          {errors.length > 0 && (
            <ul className="password-warning-list" aria-live="polite">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
      </section>
    </div>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import client from "../api/client"; // Axios configurado com baseURL

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validação simples no frontend
    if (!email || !password) {
      setError("Por favor, preencha email e senha.");
      return;
    }

    try {
      const response = 
      await client.post("/auth/login", 
        {
          email,
          password,
        });

      // Salvar token no localStorage
      localStorage.setItem("access_token", response.data.access_token);

      // Redirecionar para a página de contatos
      navigate("/contacts");
    } catch (err) {
      console.error(err);

      // Extrai mensagem de erro do backend, se houver
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        // Se for array de erros do Pydantic
        setError(detail.map((d) => d.msg).join(", "));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Erro ao fazer login.");
      }
    }
  };

  return (
    <div className="container">
      <section className="left-panel" aria-label="Área visual com logo e efeitos visuais">
        <div className="logo" aria-label="Logo Guard">
          <div className="logo-icon" aria-hidden="true"></div>
          GUARD
        </div>
        <div className="blur-shape blur-left" aria-hidden="true"></div>
        <div className="blur-shape blur-right" aria-hidden="true"></div>
      </section>

      <section className="right-panel" aria-label="Formulário de login">
        <p className="top-right-text">
          Não tem uma conta?
          <a href="/register" tabIndex={0}>Criar conta</a>
        </p>

        <h1 className="form-title">Acessar conta</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="Seu e-mail aqui"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="password-warning-list">{error}</p>}

          <button type="submit" className="submit-btn" aria-label="Login">
            Entrar
          </button>
        </form>
      </section>
    </div>
  );
}

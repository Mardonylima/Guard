import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const isAuthed = !!localStorage.getItem("access_token");

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  return (
    <header style={{ padding: "12px 20px", borderBottom: "1px solid #eee" }}>
      <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <strong>Guard</strong>
        <Link to="/contacts">Contatos</Link>
        <Link to="/contacts/new">Cadastrar</Link>
        <div style={{ marginLeft: "auto" }}>
          {isAuthed ? (
            <button onClick={handleLogout}>Sair</button>
          ) : (
            <Link to="/login">Entrar</Link>
          )}
        </div>
      </nav>
    </header>
  );
}

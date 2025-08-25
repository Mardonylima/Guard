import React, { useState, useRef, useEffect } from "react";
import client from "../api/client"; // Axios configurado com baseURL
import "../styles/contactForm.css";

export default function ContactForm({ onSaved }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const tooltipTimeout = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Limpa o timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current);
      }
    };
  }, []);

  // Preview da imagem
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validação básica do tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError("Por favor, selecione um arquivo de imagem válido.");
        return;
      }
      
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      
      // Limpa mensagem de erro anterior relacionada à foto
      if (error.includes("imagem")) {
        setError("");
      }
    }
  };

  // Submit do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !phone) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Validação de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, insira um email válido.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    if (photo) formData.append("photo", photo);

    try {
      setLoading(true);
      await client.post("/contacts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Reset do formulário
      setName(""); 
      setEmail(""); 
      setPhone(""); 
      setPhoto(null); 
      setPhotoPreview(null);
      
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar contato. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Tooltip secreto no botão Salvar
  const handleMouseEnter = () => {
    tooltipTimeout.current = setTimeout(() => setShowTooltip(true), 7000);
  };
  
  const handleMouseLeave = () => {
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }
    setShowTooltip(false);
  };

  return (
    <section className="contact-form">
      <aside className="sidebar">
        <ul>
          <li className="logo">
            <a href="#">
              <span className="icon"><i className="bi bi-shield-slash-fill"></i></span>
              <span className="text">Guard</span>
            </a>
          </li>
          <li><a href="/contacts" title="Tela principal"><span className="icon"><i className="bi bi-people-fill"></i></span><span className="text">Principal</span></a></li>
          <li><a href="/contacts/new" title="Adicionar contato"><span className="icon"><i className="bi bi-journal-plus"></i></span><span className="text">Criar Contato</span></a></li>
          <li><a href="/login" title="Logout"><span className="icon"><i className="bi bi-box-arrow-right"></i></span><span className="text">Sair</span></a></li>
          <li className="footer"><span className="text">Logado como: {localStorage.getItem("email") || "Usuário"}</span></li>
        </ul>
      </aside>

      <h1>Adicionar Contato</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label>Nome *</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="Digite o nome completo"
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="exemplo@email.com"
          />
        </div>

        <div className="form-group">
          <label>Telefone *</label>
          <input 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            required 
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="form-group">
          <label>Foto</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoChange} 
            id="photo-upload"
          />
          {photoPreview && (
            <div className="photo-preview-container">
              <img src={photoPreview} alt="Preview" className="photo-preview" />
              <button 
                type="button" 
                onClick={() => {
                  setPhoto(null);
                  setPhotoPreview(null);
                  // Limpa o input file
                  document.getElementById('photo-upload').value = '';
                }}
                className="remove-photo-btn"
              >
                Remover Foto
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-describedby={showTooltip ? "secret-tooltip" : undefined}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => { 
              setName(""); 
              setEmail(""); 
              setPhone(""); 
              setPhoto(null); 
              setPhotoPreview(null);
              // Limpa o input file
              document.getElementById('photo-upload').value = '';
            }}
          >
            Cancelar
          </button>
        </div>

        {showTooltip && (
          <span 
            id="secret-tooltip" 
            className="tooltip"
            role="tooltip"
            aria-hidden={!showTooltip}
          >
            Mensagem secreta!
          </span>
        )}
      </form>
    </section>
  );
}
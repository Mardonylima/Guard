// src/pages/Contacts.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/contacts.css";

const API_URL = "http://localhost:8001"; // FastAPI rodando aqui

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startsWith, setStartsWith] = useState(null);
  const [page, setPage] = useState(1);
  
  // Estados para o modal de edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    photo: null,
    photoPreview: null
  });

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Função para lidar com erro de carregamento de imagem
  const handleImageError = (e) => {
    e.target.src = "https://placehold.co/40x40/888/555/png?text=?"; // Imagem padrão
    e.target.style.opacity = "0.5"; // Deixa mais sutil
  };

  // Função para validar URL da foto
  const getPhotoUrl = (photo) => {
    if (!photo) return "https://placehold.co/40x40/888/555/png?text=?";
    
    // Se já for URL completa, retorna como está
    if (photo.startsWith('http')) {
      return photo;
    }
    
    // Se for caminho relativo, constrói a URL completa
    if (photo.startsWith('/')) {
      return `http://localhost:8001${photo}`;
    }
    
    // Para outros casos, tenta construir URL completa
    return `http://localhost:8001/${photo}`;
  };

  async function fetchContacts() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${API_URL}/contacts/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { starts_with: startsWith, page, limit: 30 },
      });

      setContacts(res.data.contacts || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar contatos.");
      setContacts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }

  // Função para excluir contato
  const handleDelete = async (contactId, contactName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o contato "${contactName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_URL}/contacts/${contactId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Atualiza a lista de contatos após exclusão
      fetchContacts();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir contato.");
    }
  };

  // Função para abrir modal de edição
  const handleEdit = (contact) => {
    setEditingContact(contact);
    setEditForm({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      photo: null,
      photoPreview: contact.photo ? getPhotoUrl(contact.photo) : null
    });
    setShowEditModal(true);
  };

  // Função para fechar modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingContact(null);
    setEditForm({
      name: "",
      email: "",
      phone: "",
      photo: null,
      photoPreview: null
    });
  };

  // Função para lidar com mudança de foto no formulário de edição
  const handleEditPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  // Função para salvar edição
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    try {
        const token = localStorage.getItem("access_token");
        const formData = new FormData();
        formData.append("name", editForm.name);
        formData.append("email", editForm.email);
        formData.append("phone", editForm.phone);
        if (editForm.photo) {
            formData.append("photo", editForm.photo);
        }

        // Usar axios com configuração mais explícita
        const response = await axios({
            method: 'put',
            url: `${API_URL}/contacts/${editingContact.id}/`,
            data: formData,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log("Resposta do servidor:", response.data);
        
        closeEditModal();
        fetchContacts();
        
    } catch (err) {
        console.error("Erro completo:", err);
        console.error("Response data:", err.response?.data);
        console.error("Response status:", err.response?.status);
        
        const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.error || 
                           err.message || 
                           "Erro desconhecido ao atualizar contato";
        
        alert(`Erro ao atualizar: ${errorMessage}`);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [startsWith, page]);

  return (
    <div className="app-container">
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

      <main style={{ marginLeft: "5px", padding: "5px" }}>
        <h1>Lista de Contatos</h1>

        <div className="contacts-wrapper">
          <nav className="alphabet-filter scrollbar-hide">
            {letters.map((letter) => (
              <button
                key={letter}
                className={`icon-btn ${startsWith === letter ? "active-letter" : ""}`}
                onClick={() => { setStartsWith(letter); setPage(1); }}
              >
                {letter}
              </button>
            ))}
            
            {/* Botão para limpar o filtro */}
            <button
              className={`icon-btn ${startsWith === null ? "active-letter" : ""}`}
              onClick={() => { setStartsWith(null); setPage(1); }}
            >
              Todos
            </button>
          </nav>

          <section className="contact-list">
            {loading && <p>Carregando...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && contacts.length === 0 && <p>Nenhum contato encontrado.</p>}
            
            {!loading && contacts.length > 0 && (
              <>
                <ul className="contacts-ul">
                  {contacts.map((c) => (
                    <li key={c.id} className="contacts-li">
                      <img 
                        src={getPhotoUrl(c.photo)} 
                        alt={`Foto de ${c.name}`} 
                        className="contact-photo"
                        onError={handleImageError}
                      />
                      <span className="contact-name">{c.name}</span>
                      <span className="contact-phone">{c.phone}</span>
                      <span className="contact-email">{c.email}</span>
                      <button 
                        className="icon-btn edit-btn"
                        onClick={() => handleEdit(c)}
                      >
                        Editar
                      </button>
                      <button 
                        className="icon-btn delete-btn"
                        onClick={() => handleDelete(c.id, c.name)}
                      >
                        Excluir
                      </button>
                    </li>
                  ))}
                </ul>

                {pagination && (
                  <div className="pagination">
                    <button 
                      disabled={page <= 1} 
                      onClick={() => setPage((p) => p - 1)} 
                      className="icon-btn"
                    >
                      Anterior
                    </button>
                    <span>Página {pagination.page} de {pagination.total_pages}</span>
                    <button 
                      disabled={page >= pagination.total_pages} 
                      onClick={() => setPage((p) => p + 1)} 
                      className="icon-btn"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Contato</h2>
              <button className="close-btn" onClick={closeEditModal}>×</button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="edit-form">
              <div className="form-group">
                <label>Nome *</label>
                <input 
                  value={editForm.name} 
                  onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  onChange={(e) => setEditForm(prev => ({...prev, email: e.target.value}))} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Telefone *</label>
                <input 
                  value={editForm.phone} 
                  onChange={(e) => setEditForm(prev => ({...prev, phone: e.target.value}))} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Foto</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleEditPhotoChange} 
                />
                {editForm.photoPreview && (
                  <div className="photo-preview-container">
                    <img src={editForm.photoPreview} alt="Preview" className="photo-preview" />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeEditModal} className="cancel-btn">
                  Cancelar
                </button>
                <button type="submit" className="save-btn">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
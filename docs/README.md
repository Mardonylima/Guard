# Guard - Sistema de Gerenciamento de Contatos

Sistema fullstack para gerenciamento de contatos com autenticação, upload de fotos e interface web moderna.

## 🏗️ Arquitetura

O projeto é dividido em 4 containers Docker:

- **db**: PostgreSQL (banco de dados)
- **backend**: Django (autenticação e administração)
- **api**: FastAPI (API REST para frontend)
- **frontend**: React (interface web)

## 🚀 Tecnologias

- **Frontend**: React + Axios
- **Backend API**: FastAPI
- **Backend Admin**: Django
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT
- **Upload de Imagens**: Django Media Files
- **Infraestrutura**: Docker + docker-compose

## 📁 Estrutura do Projeto

```
Guard/
├─ Infra/
│  ├─ docker-compose.yml
│  └─ .env
├─ frontend/
│  ├─ src/
│  │  ├─ Index.js
│  │  ├─ App.jsx 
│  │  ├─ api/
│  │  │   └─ client.js
│  │  ├─ pages/
│  │  │   ├─ ContactForm.jsx
│  │  │   ├─ Login.jsx
│  │  │   ├─ Contacts.jsx
│  │  │   └─ RegisterForm.jsx
│  │  ├─ routes/
│  │  │   └─ ProtectedRoute.jsx
│  │  ├─ components/
│  │  │   ├─ Container.jsx
│  │  │   └─ Header.jsx
│  │  └─ styles/
│  │      ├─ contactForm.css
│  │      ├─ login.css
│  │      └─ contacts.css
│  ├─public/
│  │  └─ index.html
│  ├─ package.json
│  └─ Dockerfile
├─ api/              # FastAPI app
│  ├─__pycache__/
│  ├─auth/
│  │  ├─__pycache__/
│  │  ├─routes.py
│  │  ├─schemas.py
│  │  └─security.py
│  ├─dockerfile
│  ├─main.py
│  └─requirements.txt
├─ backend/          # Django project
│  ├─ app_backend/
│  │  ├─ settings.py
│  │  ├─ urls.py
│  │  ├─ wsgi.py
│  │  └─ asgi.py
│  ├─ users/
│  │  ├─ models.py
│  │  ├─ admin.py
│  │  └─ migrations/
│  ├─ contacts/
│  │  ├─ models.py
│  │  ├─ routes.py
│  │  ├─ schemas.py
│  │  ├─ serializers.py
│  │  └─ views.py
│  ├─ manage.py
│  ├─ fix_duplicated_paths.py
│  ├─ requirements.txt
│  └─ Dockerfile
└─ README.md
```

## ⚙️ Configuração Inicial

### 1. Pré-requisitos
- Docker
- Docker Compose

### 2. Variáveis de Ambiente
Crie o arquivo `.env` na pasta `Infra/`:

```env
# PostgreSQL
POSTGRES_DB=devdb
POSTGRES_USER=devuser
POSTGRES_PASSWORD=devpass
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Django
DJANGO_SECRET_KEY=django-insecure-u(8ko9xkte9gzk=12nh7z4@^i2sy*v+&ve^8b((&lc5+lj@)6&
DJANGO_DEBUG=True
```

### 3. Iniciar a Aplicação

```bash
docker-compose -f .\Infra\docker-compose.yml up -d --build
```

### 4. Acessar os Serviços

- **Frontend**: http://localhost:3000
- **Django Admin**: http://localhost:8000/admin
- **FastAPI Docs**: http://localhost:8001/docs

### 5. Criar Superusuário Django

```bash
docker-compose -f .\Infra\docker-compose.yml exec backend python manage.py createsuperuser
```

## 🎯 Funcionalidades

### Autenticação
- Registro de usuários
- Login com JWT
- Proteção de rotas

### Contatos
- Listagem com filtro alfabético
- Cadastro com foto
- Edição e exclusão
- Paginação

### Upload de Imagens
- Suporte a formatos JPG/PNG
- Preview em tempo real
- Armazenamento local em desenvolvimento

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
# Reiniciar containers
docker-compose -f .\Infra\docker-compose.yml restart

# Ver logs
docker-compose -f .\Infra\docker-compose.yml logs api

# Acessar container do backend
docker-compose -f .\Infra\docker-compose.yml exec backend bash

# Acessar container do frontend
docker-compose -f .\Infra\docker-compose.yml exec frontend bash
```

### Migrações Django
```bash
# Criar migrações
docker-compose -f .\Infra\docker-compose.yml exec backend python manage.py makemigrations users contacts

# Aplicar migrações
docker-compose -f .\Infra\docker-compose.yml exec backend python manage.py migrate
```

## 📊 Diagrama ERD

Veja o arquivo `/docs/erd.png` para o diagrama de relacionamento de entidades.

## 🔒 Segurança

- CORS configurado apenas para localhost em desenvolvimento
- Senhas armazenadas com hash
- Tokens JWT com expiração
- Validação de formulários

## 📁 Estrutura de Uploads

```
backend/media/
└── contacts_photos/
    ├── uuid-filename.jpg
    └── ...
```

## 🌐 Endpoints API

### Autenticação
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login
- `GET /auth/me` - Dados do usuário logado

### Contatos
- `GET /contacts/` - Listar contatos
- `POST /contacts/` - Criar contato
- `PUT /contacts/{id}/` - Atualizar contato
- `DELETE /contacts/{id}/` - Excluir contato

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
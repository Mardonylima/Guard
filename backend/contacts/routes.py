from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from typing import Optional
from django.core.paginator import Paginator, EmptyPage
from django.core.files.base import ContentFile
from auth.security import get_current_user
from contacts.models import Contact
from contacts.schemas import ContactOut, Pagination, ContactsResponse
import os
import uuid
import logging


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contacts", tags=["contacts"])

# ------------------------------------------------------------
# GET: Listagem de contatos
# ------------------------------------------------------------
@router.get("/", response_model=ContactsResponse)
def list_contacts(
    starts_with: Optional[str] = Query(None, min_length=1, max_length=1),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    current_user=Depends(get_current_user)
):
    queryset = Contact.objects.filter(owner=current_user).order_by("id")

    if starts_with:
        queryset = queryset.filter(name__istartswith=starts_with)

    paginator = Paginator(queryset, limit)
    try:
        contacts_page = paginator.page(page)
    except EmptyPage:
        contacts_page = []

    contacts_data = []
    for c in contacts_page:
        # CORREÇÃO: Extrair a URL como string
        photo_url = None
        if c.photo and hasattr(c.photo, 'url'):
            photo_url = f"http://localhost:8000{c.photo.url}"
        
        contacts_data.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "photo": photo_url  # AGORA CORRETO: string ou None
        })

    return {
        "contacts": contacts_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_pages": paginator.num_pages,
            "total_items": paginator.count,
        },
    }


# ------------------------------------------------------------
# POST: Criar contato
# ------------------------------------------------------------

# contacts/routes.py - função create_contact
@router.post("/", response_model=dict)
def create_contact(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    photo: UploadFile | None = File(None),
    current_user=Depends(get_current_user)
):
    contact = Contact(
        owner=current_user,
        name=name,
        email=email,
        phone=phone
    )

    if photo:
        # Gera um nome único para o arquivo (sem o prefixo contacts_photos/)
        file_extension = os.path.splitext(photo.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Lê o conteúdo do arquivo
        contents = photo.file.read()
        
        # Salva o arquivo usando o sistema de storage do Django
        # O upload_to='contacts_photos/' do model já coloca no diretório certo
        contact.photo.save(unique_filename, ContentFile(contents), save=False)

    contact.save()
    return {"message": "Contato criado com sucesso!", "id": contact.id}

# ------------------------------------------------------------
# DELETE: Excluir contato
# ------------------------------------------------------------
@router.delete("/{contact_id}/", response_model=dict)
def delete_contact(
    contact_id: int,
    current_user=Depends(get_current_user)
):
    try:
        contact = Contact.objects.get(id=contact_id, owner=current_user)
        # Exclui o arquivo de foto se existir
        if contact.photo:
            if os.path.exists(contact.photo.path):
                os.remove(contact.photo.path)
        # Exclui o contato
        contact.delete()
        return {"message": "Contato excluído com sucesso!"}
    except Contact.DoesNotExist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contato não encontrado")
    
# ------------------------------------------------------------
# PUT: Atualizar contato (para o popup de edição)
# ------------------------------------------------------------
@router.put("/{contact_id}/")
def update_contact(
    contact_id: int,
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    photo: UploadFile | None = File(None),
    current_user=Depends(get_current_user)
):
    try:
        # Busca o contato
        try:
            contact = Contact.objects.get(id=contact_id, owner=current_user)
        except Contact.DoesNotExist:
            raise HTTPException(status_code=404, detail="Contato não encontrado")
        
        # Atualiza campos básicos
        contact.name = name
        contact.email = email
        contact.phone = phone
        
        # Processa foto se foi enviada
        if photo and photo.filename:
            # Remove foto antiga
            if contact.photo:
                try:
                    if hasattr(contact.photo, 'path') and os.path.exists(contact.photo.path):
                        os.remove(contact.photo.path)
                except Exception as e:
                    print(f"Aviso: não foi possível remover foto antiga: {e}")
            
            # Salva nova foto
            ext = os.path.splitext(photo.filename)[1]
            filename = f"{uuid.uuid4()}{ext}"
            contents = photo.file.read()
            contact.photo.save(filename, ContentFile(contents), save=True)
        
        contact.save()
        
        # CORREÇÃO: Retorna a URL da foto como string, não o objeto
        photo_url = None
        if contact.photo and hasattr(contact.photo, 'url'):
            photo_url = f"http://localhost:8000{contact.photo.url}"
        
        return {
            "id": contact.id,
            "name": contact.name,
            "email": contact.email,
            "phone": contact.phone,
            "photo": photo_url  # AGORA CORRETO: string ou None
        }
        
    except Exception as e:
        print(f"Erro no update_contact: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
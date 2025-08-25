# contacts/schemas.py
from pydantic import BaseModel
from typing import List, Optional

class ContactOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    photo: Optional[str] = None

    model_config = {"from_attributes": True}  # para Pydantic v2

class Pagination(BaseModel):
    page: int
    limit: int
    total_pages: int
    total_items: int

class ContactsResponse(BaseModel):
    contacts: List[ContactOut]
    pagination: Pagination

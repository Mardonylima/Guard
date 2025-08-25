# contacts/views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Contact
from .serializers import ContactSerializer

class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    
    def get_queryset(self):
        # Filtra apenas os contatos do usuário logado
        return Contact.objects.filter(owner=self.request.user)
    
    @action(detail=False, methods=['get'])
    def list_filtered(self, request):
        """
        Listagem de contatos com filtro por inicial e paginação
        """
        queryset = self.get_queryset().order_by('name')
        
        # Filtro por inicial do nome
        starts_with = request.GET.get('starts_with')
        if starts_with:
            queryset = queryset.filter(name__istartswith=starts_with)
        
        # Paginação
        page = request.GET.get('page', 1)
        limit = request.GET.get('limit', 20)
        
        paginator = Paginator(queryset, limit)
        try:
            contacts_page = paginator.page(page)
        except PageNotAnInteger:
            contacts_page = paginator.page(1)
        except EmptyPage:
            contacts_page = paginator.page(paginator.num_pages)
        
        serializer = self.get_serializer(contacts_page, many=True)
        
        return Response({
            'contacts': serializer.data,
            'pagination': {
                'page': contacts_page.number,
                'total_pages': paginator.num_pages,
                'total_items': paginator.count,
            }
        })

def contacts_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Usuário não autenticado'}, status=401)
    
    user = request.user
    contacts = Contact.objects.filter(owner=user).order_by('name')
    
    # Filtro por inicial do nome
    starts_with = request.GET.get('starts_with')
    if starts_with:
        contacts = contacts.filter(name__istartswith=starts_with)
    
    # Paginação
    page_number = request.GET.get('page', 1)
    limit = request.GET.get('limit', 20)
    paginator = Paginator(contacts, limit)
    
    try:
        page_obj = paginator.page(page_number)
    except PageNotAnInteger:
        page_obj = paginator.page(1)
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages)
    
    contacts_data = [
        {
            'id': c.id,
            'owner_id': c.owner.id,
            'name': c.name,
            'email': c.email,
            'phone': c.phone,
            'photo': request.build_absolute_uri(c.photo.url) if c.photo and c.photo.url else None,
            'created_at': c.created_at.isoformat(),
        }
        for c in page_obj
    ]
    
    return JsonResponse({
        'contacts': contacts_data,
        'pagination': {
            'page': page_obj.number,
            'total_pages': paginator.num_pages,
            'total_items': paginator.count,
        }
    })
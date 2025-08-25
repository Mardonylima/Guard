# fix_duplicated_paths.py
import os
import django
from django.conf import settings

# Configura o Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app_backend.settings')
django.setup()

from contacts.models import Contact

def fix_duplicated_paths():
    """Corrige os caminhos duplicados de fotos"""
    
    media_root = settings.MEDIA_ROOT
    print(f"MEDIA_ROOT: {media_root}")
    
    for contact in Contact.objects.all():
        if contact.photo and contact.photo.name:
            old_path = contact.photo.name
            print(f"Verificando contato {contact.id}: {old_path}")
            
            # Verifica se tem caminho duplicado
            if old_path.startswith('contacts_photos/contacts_photos/'):
                # Extrai apenas o nome do arquivo
                filename = old_path.split('/')[-1]
                new_path = f'contacts_photos/{filename}'
                
                print(f"  Corrigindo: {old_path} -> {new_path}")
                
                # Atualiza o caminho no banco
                contact.photo.name = new_path
                contact.save()
                
                # Remove o arquivo antigo duplicado (se existir)
                old_file_path = os.path.join(media_root, old_path)
                if os.path.exists(old_file_path):
                    try:
                        os.remove(old_file_path)
                        print(f"  Arquivo duplicado removido: {old_file_path}")
                    except Exception as e:
                        print(f"  Erro ao remover arquivo: {e}")
            
            # Também verifica o caminho físico do arquivo
            if contact.photo and hasattr(contact.photo, 'path'):
                file_path = contact.photo.path
                if os.path.exists(file_path):
                    print(f"  Arquivo existe: {file_path}")
                else:
                    print(f"  Arquivo NÃO existe: {file_path}")

if __name__ == "__main__":
    fix_duplicated_paths()
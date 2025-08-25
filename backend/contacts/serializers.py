from rest_framework import serializers
from .models import Contact

class ContactSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'phone', 'photo', 'photo_url']
    
    def get_photo_url(self, obj):
        """
        Retorna a URL completa da foto se existir
        """
        if obj.photo and hasattr(obj.photo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None
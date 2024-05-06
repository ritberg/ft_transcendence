from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

class UserAccountTests(APITestCase):

    def setUp(self):
        # Créer un utilisateur pour tester le login
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        self.user.save()

    def test_login_user(self):
        """
        Test de la connexion d'un utilisateur.
        """
        url = reverse('login')  # Assurez-vous que l'URL est correctement nommée dans vos urls.py
        data = {'username': 'testuser', 'password': 'testpassword123'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('User logged in successfully', response.data['message'])

    def test_logout_user(self):
        """
        Test de la déconnexion d'un utilisateur.
        """
        self.client.login(username='testuser', password='testpassword123')
        url = reverse('logout')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('User logged out successfully', response.data['message'])

    def test_register_user(self):
        """
        Test de l'enregistrement d'un nouvel utilisateur.
        """
        url = reverse('register')
        data = {'username': 'newuser', 'password': 'newpassword123', 'email': 'newuser@example.com'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('User registered successfully', response.data['message'])

    def test_register_user_existing(self):
        """
        Test de l'enregistrement d'un utilisateur déjà existant.
        """
        url = reverse('register')
        data = {'username': 'testuser', 'password': 'testpassword123', 'email': 'test@example.com'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('A user with that username already exists.', str(response.data))

    def test_update_user(self):
        """
        Test de la mise à jour des informations d'un utilisateur.
        """
        self.client.login(username='testuser', password='testpassword123')

        user = User.objects.get(username='testuser')

        url = reverse('update')
        data = {'id': user.id, 'username': 'newtestuser', 'password': 'newpassword123', 'email': 'test2@example.com'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
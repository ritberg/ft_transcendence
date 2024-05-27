from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from .models import FriendRequest

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
    
    def test_send_friend_request(self):
        """
        Test de l'envoi d'une demande d'ami.
        """
        self.client.login(username='testuser', password='testpassword123')

        user = User.objects.get(username='testuser')
        friend = User.objects.create_user(username='friend', password='friendpassword123')

        url = reverse('friend-request')
        data = {'to_user': friend.id}
        response = self.client.post(url, data, format='json')
        # print(response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('Friend request sent successfully', response.data['message'])

    def test_send_friend_request_self(self):
        """
        Test de l'envoi d'une demande d'ami à soi-même.
        """
        self.client.login(username='testuser', password='testpassword123')

        user = User.objects.get(username='testuser')

        url = reverse('friend-request')
        data = {'to_user': user.id}
        response = self.client.post(url, data, format='json')
        # print(response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('You cannot send friend request to yourself.', str(response.data))

    def test_send_friend_request_existing(self):
        """
        Test de l'envoi d'une demande d'ami à un utilisateur déjà ami.
        """
        self.client.login(username='testuser', password='testpassword123')

        user = User.objects.get(username='testuser')
        friend = User.objects.create_user(username='friend', password='friendpassword123')
        user.friends.add(friend)

        url = reverse('friend-request')
        data = {'to_user': friend.id}
        response = self.client.post(url, data, format='json')
        # print(response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('You are already friends with this user.', str(response.data))
    
    def test_accept_friend_request(self):
        """
        Test de l'acceptation d'une demande d'ami.
        """
        self.client.login(username='testuser', password='testpassword123')

        user = User.objects.get(username='testuser')
        friend = User.objects.create_user(username='friend', password='friendpassword123')
        friend_request = FriendRequest.objects.create(from_user=friend, to_user=user)

        url = reverse('accept-friend-request')
        data = {'friend_request_id': friend_request.id}
        response = self.client.post(url, data, format='json')
        # print(response.data)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertIn('accepted friend request', str(response.data['message']))

    def test_accept_friend_request_wrong_user(self):
        """
        Test de l'acceptation d'une demande d'ami par un utilisateur incorrect.
        """
        self.client.login(username='testuser', password='testpassword123')

        user = User.objects.get(username='testuser')
        friend = User.objects.create_user(username='friend', password='friendpassword123')
        friend_request = FriendRequest.objects.create(from_user=friend, to_user=friend)

        url = reverse('accept-friend-request')
        data = {'friend_request_id': friend_request.id}
        response = self.client.post(url, data, format='json')
        # print(response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Friend request cannot be accepted by this user', str(response.data))
    
    def test_reject_friend_request(self):
        """
        Test du rejet d'une demande d'ami.
        """
        self.client.login(username='testuser', password='testpassword123')

        user = User.objects.get(username='testuser')
        friend = User.objects.create_user(username='friend', password='friendpassword123')
        friend_request = FriendRequest.objects.create(from_user=friend, to_user=user)

        url = reverse('reject-friend-request')
        data = {'friend_request_id': friend_request.id}
        response = self.client.post(url, data, format='json')
        # print(response.data)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertIn('rejected friend request', str(response.data['message']))

    def test_online_status(self):
        """
        Test de la mise à jour du statut en ligne.
        """
        self.client.login(username='testuser', password='testpassword123')

        user = User.objects.get(username='testuser')

        url = reverse('update')
        data = {'id': user.id, 'status': 'online'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
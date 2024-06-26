echo "Démarrage de l'initialisation de Django"
echo "backend name: $BOT_SERVICE_NAME"

echo "Installation de Django"

if [ ! -d "/home/transcendance/$BOT_SERVICE_NAME" ]; then
    # creation of the new project
    django-admin startproject $BOT_SERVICE_NAME
else
    echo "Le répertoire du projet existe déjà"
fi

cd $BOT_SERVICE_NAME

pip install -U 'Twisted[tls,http2]'
python3 manage.py makemigrations
python3 manage.py migrate
daphne -b 0.0.0.0 -p 8002 project.asgi:application
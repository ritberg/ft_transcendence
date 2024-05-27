echo "Démarrage de l'initialisation de Django"
echo "backend name: $CHAT_SERVICE_NAME"

echo "Installation de Django"

if [ ! -d "/home/transcendance/$CHAT_SERVICE_NAME" ]; then
    # creation of the new project
    django-admin startproject $CHAT_SERVICE_NAME
else
    echo "Le répertoire du projet existe déjà"
	exit
fi

cd $CHAT_SERVICE_NAME

# # Create new app
# python3 manage.py startapp channels_demo
python3 manage.py makemigrations
python3 manage.py migrate

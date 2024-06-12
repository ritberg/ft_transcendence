import environ

env = environ.Env()
environ.Env.read_env(env_file='.env.django')

default_app_config = f'{env("AUTH_APP_NAME")}.apps.AuthUserConfig'
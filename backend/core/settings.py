# settings.py

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME', 'zoo_shop'),
        'USER': os.environ.get('DB_USER', 'django'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'dz_password'),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': '3306',
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
# ZooMarket — Интернет-зоомагазин
Описание
    Веб-приложение для покупки товаров для домашних животных: корма, игрушки, аксессуары, ветеринарные препараты
    Проект разрабатывается в рамках выпускной квалификационной работы студентом группы 1ИСП-22 Сорокиным Даниилом под руководством Гайдуковой К. М.
# 🎨 Макет интерфейса
    Figma: https://www.figma.com/design/jchdOXdmxSkcNAMDFiJBam/%D0%92%D0%9A%D0%A0?node-id=0-1&t=gXJxRePzXRsvx4Rw-1
    Экраны
    1 Главная — витрина, категории, акции
    2 Каталог — товары с фильтрами
    3 Товар — детальная карточка
    4 Авторизация — вход/регистрация
    5 Корзина — оформление заказа
    Сценарии
    - Просмотр и фильтрация каталога
    - Добавление товара в корзину
    - Оформление заказа с доставкой
    - Регистрация и вход
# 🛠 Стек технологий
    Бэкенд
    - Язык: Python 3.14
    - Фреймворк: Django 6.0.4
    - REST API: Django REST Framework 3.15
    - База данных: MySQL (продакшен), SQLite (разработка)
    Фронтенд
    - Фреймворк: React 18
    - Сборщик: Vite 5.4
    - Маршрутизация: React Router 6
    - HTTP-клиент: Axios
    Инструменты
    - Контроль версий: Git + GitHub
    - Контейнеризация: Docker
    - Тестирование: Pytest (бэкенд), Jest (фронтенд)
# 📁 Структура проекта
    ZOOMAGAZINE_VKR/
    ├── backend/
    │ ├── articles/
    │ │ ├── models.py (Product, Category, Cart, Order)
    │ │ ├── views.py (API endpoints)
    │ │ ├── serializers.py
    │ │ ├── urls.py
    │ │ └── admin.py
    │ ├── core/
    │ │ ├── settings.py
    │ │ ├── urls.py
    │ │ └── wsgi.py
    │ ├── manage.py
    │ └── requirements.txt
    │
    ├── frontend/
    │ ├── src/
    │ │ ├── components/ (Header, Footer, ProductCard)
    │ │ ├── pages/ (Home, Catalog, Product, Cart, Auth)
    │ │ ├── services/api.js
    │ │ ├── App.jsx
    │ │ └── main.jsx
    │ ├── index.html
    │ ├── package.json
    │ └── vite.config.js
    │
    ├── docker/
    │ └── docker-compose.yml
    │
    ├── README.md
    └── .gitignore
# 🚀 Запуск проекта
    Требования
    Python 3.11+
    Node.js 18+
    Git
    Backend
        cd backend
        python -m venv venv
        venv\Scripts\activate
        pip install -r requirements.txt
        python manage.py migrate
        python manage.py createsuperuser
        python manage.py runserver

    Бэкенд будет доступен по адресам:
    - Админ-панель: http://127.0.0.1:8000/admin/
    - API: http://127.0.0.1:8000/api/
    - Товары: http://127.0.0.1:8000/api/products/
    Frontend
        cd frontend
        npm install
        npm run dev
    
    Фронтенд будет доступен по адресу:
    - Сайт: http://localhost:3000
    Docker (для продакшена)
    docker-compose -f docker/docker-compose.yml up --build -d
    docker-compose exec backend python manage.py migrate
    docker-compose exec backend python manage.py createsuperuser
    
    Сервисы будут доступны:
    - Фронтенд: http://localhost:3000
    - Бэкенд API: http://localhost:8000/api/
    - MySQL: localhost:3306
    - Adminer: http://localhost:8080
# 🔌 API Endpoints
    Категории
    - GET /api/categories/ — список категорий
    - GET /api/categories/{slug}/ — категория по slug
    Товары
    - GET /api/products/ — список товаров с фильтрацией
    - GET /api/products/{slug}/ — детали товара
    - GET /api/products/by_category/?category_slug=cats — фильтр по категории
    - GET /api/products/search/?q=корм — поиск товаров
    Корзина
    - GET /api/cart/ — получить корзину
    - POST /api/cart/ — добавить товар {"action":"add","product_id":5,"quantity":2}
    - POST /api/cart/ — удалить товар {"action":"remove","product_id":5}
    - POST /api/cart/ — очистить корзину {"action":"clear"}
    Заказы
    - GET /api/orders/ — список заказов (требуется авторизация)
    - POST /api/orders/ — создать заказ (требуется авторизация)
# 🔐 Настройки безопасности
    Для разработки в settings.py настроено:
    DEBUG = True
    ALLOWED_HOSTS = ['*']

    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    REST_FRAMEWORK = {
        'DEFAULT_PERMISSION_CLASSES': [
            'rest_framework.permissions.AllowAny',
        ],
        'DEFAULT_AUTHENTICATION_CLASSES': [],
    }
    Перед выкладкой на сервер нужно:
    - Поставить DEBUG = False
    - Указать реальные домены в ALLOWED_HOSTS
    - Включить CsrfViewMiddleware
    - Настроить реальную аутентификацию
    - Вынести SECRET_KEY в переменные окружения
# 🧪 Тестирование
    Бэкенд
    cd backend
    pip install pytest pytest-django
    pytest articles/tests/ -v
    Фронтенд
    cd frontend
    npm install --save-dev jest @testing-library/react
    npm test
# 📦 Зависимости
    backend/requirements.txt

    Django>=6.0
    djangorestframework>=3.15
    pymysql==1.1.0
    python-dotenv==1.0.0
    django-cors-headers>=4.3
    Pillow>=10.1.0
    cryptography>=41.0.7

    frontend/package.json
    
    react@18
    react-dom@18
    vite@5.4
    axios@1.x
    react-router-dom@6.x
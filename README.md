# ZooMarket — Интернет-зоомагазин

## Описание
Веб-приложение для покупки товаров для домашних животных: корма, игрушки, аксессуары, ветеринарные препараты.

## 🎨 Макет интерфейса
**Figma:** [Ссылка на макет](https://www.figma.com/file/ВАШ_FILE_ID)

### Экраны:
1. Главная — витрина, категории, акции
2. Каталог — товары с фильтрами
3. Товар — детальная карточка
4. Авторизация — вход/регистрация
5. Корзина — оформление заказа

### Сценарии:
- Просмотр и фильтрация каталога
- Добавление товара в корзину
- Оформление заказа с доставкой
- Регистрация и вход

## 🛠 Стек технологий
| Компонент | Технология |
|-----------|-----------|
| Backend | Python + Django 4.2 + DRF |
| Frontend | React 18 + Vite + TypeScript |
| Database | MySQL |
| DevOps | Docker, Git, GitHub |

## 📁 Структура
ZOOMAGAZINE_VKR/
├── backend/
│ ├── articles/ (Product, Category, Cart, Order)
│ ├── core/ (settings, urls)
│ └── requirements.txt
├── frontend/
│ ├── src/components/ (Layout, Header, Footer, ProductCard)
│ ├── src/pages/ (Home, Catalog, Product, Login)
│ └── package.json
└── docker/docker-compose.yml

## 🚀 Запуск

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
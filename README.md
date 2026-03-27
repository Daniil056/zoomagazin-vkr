# Internet Zoo Shop (ВКР)

Проект интернет-зоомагазина для выпускной квалификационной работы.
Студент: Сорокин Даниил, группа 1ИСП-22.

## Описание идеи
Платформа для продажи товаров для животных с возможностью онлайн-оплаты, 
личным кабинетом и админ-панелью для управления ассортиментом.

## Используемый стек технологий
- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Python 3.10, Django 4.x
- **DB:** MySQL 8.0
- **Deploy:** Docker, Docker-compose

## Описание архитектуры
Используется трехуровневая архитектура (Layered Architecture):
1. Presentation Layer (React SPA)
2. Application Layer (Django REST API)
3. Data Layer (MySQL)

## Структура каталогов
- `/frontend` - клиентская часть (React)
- `/backend` - серверная часть (Django)
- `/docker` - конфиги контейнеров

## Инструкции по запуску

### 1. Установка зависимостей
Для бэкенда:
```bash
cd backend
pip install -r requirements.txt

cd frontend
npm install

cd docker
docker-compose up -d

Доступ
Frontend: http://localhost:5173
Backend API: http://localhost:8000/api
Admin panel: http://localhost:8000/admin

**Ссылка на репозиторий:** 
`https://github.com/Daniil056/zoomagazin-vkr`

В репозитории доступны:
- Исходный код проекта (папки frontend, backend, docker)
- Файл `.gitignore` для исключения служебных файлов
- Файл `README.md` с инструкцией по развёртыванию
- Конфигурационные файлы проекта


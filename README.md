## Адреси та порти

- **Frontend:** http://localhost:5500
- **Backend:** http://127.0.0.1:8000
- **API:** http://127.0.0.1:8000/api/v1

## Як запустити проєкт

### 1. Запустити бекенд
```bash
python3 manage.py runserver 127.0.0.1:8000
```

CORS вже налаштований для `http://localhost:5500` та `http://127.0.0.1:5500`.

### 2. Запустити фронтенд
```bash
python3 -m http.server 5500
```

### 3. Відкрити у браузері
Відкрити http://localhost:5500

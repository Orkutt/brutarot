FROM python:3.12-slim

WORKDIR /app

# Копируем зависимости отдельно — Docker кэширует этот слой
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код бэкенда
COPY app/ ./app/

# Копируем данные карт из корня проекта
# Render клонирует весь репозиторий, поэтому пути будут правильные
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
import json

input_file_path = "result.json"
output_file_path = "result_new.json"

# 1. Читаем исходный JSON из файла
with open(input_file_path, "r", encoding="utf-8") as file:
    data = json.load(file)

# 2. Добавляем ID в каждую карточку по порядку
# zip объединяет карточки и ID парами по их порядковому номеру
for card, card_id in zip(data["cards"], ids_list):
    # Создаем новый ключ "id" в самом начале словаря карточки
    updated_card = {"id": card_id}
    updated_card.update(card)

    # Находим индекс текущей карточки и заменяем её на обновленную
    index = data["cards"].index(card)
    data["cards"][index] = updated_card

# 3. Сохраняем обновленный JSON в новый файл
with open(output_file_path, "w", encoding="utf-8") as file:
    json.dump(data, file, ensure_ascii=False, indent=2)

print("ID успешно добавлены!")

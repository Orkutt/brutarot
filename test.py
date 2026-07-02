from pathlib import Path
p = Path(__file__).parent / "tarot-images.json"
print(p)        # напечатает абсолютный путь
print(p.exists())  # True если файл найден
"""Arte de César (8 nov): exterior de La Taberna del Miedo (Corredera del Cristo) e interior de la taberna → fondos del juego.
exterior 1672×941 → 1600×900 · interior 2172×724 → 2700×900 (escena con cámara que sigue al viajero)."""
import os
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'art', 'escenarios', 'corredera')
ex = Image.open(os.path.join(D, 'cesar', 'exterior_original.png')).convert('RGB').resize((1600, 900), Image.LANCZOS)
ex.save(os.path.join(D, 'exterior.jpg'), quality=88)
it = Image.open(os.path.join(D, 'cesar', 'interior_original.png')).convert('RGB').resize((2700, 900), Image.LANCZOS)
it.save(os.path.join(D, 'interior.webp'), quality=86, method=5)
for f in ('exterior.jpg', 'interior.webp'): print(f, os.path.getsize(os.path.join(D, f)) // 1024, 'KB')

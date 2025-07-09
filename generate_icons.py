 #!/usr/bin/env python3
"""
Скрипт для генерации иконок SQL Beautifier расширения
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_gradient_background(size):
    """Создает градиентный фон для иконки"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Создаем градиент от #667eea к #764ba2
    for y in range(size):
        # Интерполируем цвета
        ratio = y / size
        r1, g1, b1 = 102, 126, 234  # #667eea
        r2, g2, b2 = 118, 75, 162   # #764ba2
        
        r = int(r1 + (r2 - r1) * ratio)
        g = int(g1 + (g2 - g1) * ratio)
        b = int(b1 + (b2 - b1) * ratio)
        
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    
    return img

def draw_database_icon(draw, size, scale):
    """Рисует иконку базы данных"""
    # Размеры базы данных
    db_width = int(80 * scale)
    db_height = int(48 * scale)
    db_x = (size - db_width) // 2
    db_y = int(40 * scale)
    
    # Рисуем белый прямоугольник с закругленными углами
    radius = int(8 * scale)
    
    # Основной прямоугольник
    draw.rectangle([db_x, db_y, db_x + db_width, db_y + db_height], 
                  fill=(255, 255, 255, 230), outline=(255, 255, 255, 255))
    
    # Рисуем строки данных
    line_width = int(64 * scale)
    line_height = int(8 * scale)
    line_x = db_x + int(8 * scale)
    
    # Первая строка (синяя)
    draw.rectangle([line_x, db_y + int(8 * scale), 
                   line_x + line_width, db_y + int(16 * scale)], 
                  fill=(102, 126, 234, 255))
    
    # Вторая строка (фиолетовая)
    draw.rectangle([line_x, db_y + int(24 * scale), 
                   line_x + line_width, db_y + int(32 * scale)], 
                  fill=(118, 75, 162, 255))
    
    # Третья строка (синяя)
    draw.rectangle([line_x, db_y + int(40 * scale), 
                   line_x + line_width, db_y + int(48 * scale)], 
                  fill=(102, 126, 234, 255))

def draw_decorative_elements(draw, size, scale):
    """Рисует декоративные элементы"""
    # Круги
    draw.ellipse([int(36 * scale), int(26 * scale), 
                  int(44 * scale), int(34 * scale)], 
                 fill=(255, 255, 255, 153))
    
    draw.ellipse([int(84 * scale), int(26 * scale), 
                  int(92 * scale), int(34 * scale)], 
                 fill=(255, 255, 255, 153))
    
    draw.ellipse([int(61 * scale), int(17 * scale), 
                  int(67 * scale), int(23 * scale)], 
                 fill=(255, 255, 255, 102))

def draw_text(draw, size, scale):
    """Рисует текст SQL"""
    if size >= 48:
        try:
            # Пытаемся использовать системный шрифт
            font_size = max(8, int(16 * scale))
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            # Fallback на стандартный шрифт
            font = ImageFont.load_default()
        
        text = "SQL"
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        text_x = (size - text_width) // 2
        text_y = size - int(18 * scale) - text_height
        
        draw.text((text_x, text_y), text, fill=(255, 255, 255, 255), font=font)

def create_icon(size):
    """Создает иконку заданного размера"""
    # Создаем изображение
    img = create_gradient_background(size)
    draw = ImageDraw.Draw(img)
    
    # Масштаб для элементов
    scale = size / 128
    
    # Рисуем элементы
    draw_database_icon(draw, size, scale)
    draw_decorative_elements(draw, size, scale)
    draw_text(draw, size, scale)
    
    return img

def main():
    """Основная функция"""
    # Создаем папку icons если её нет
    if not os.path.exists('icons'):
        os.makedirs('icons')
    
    # Размеры иконок для Chrome расширения
    sizes = [16, 48, 128]
    
    print("Генерация иконок SQL Beautifier...")
    
    for size in sizes:
        print(f"Создание иконки {size}x{size}...")
        icon = create_icon(size)
        filename = f"icons/icon{size}.png"
        icon.save(filename, 'PNG')
        print(f"Сохранено: {filename}")
    
    print("Все иконки созданы успешно!")
    print("Файлы сохранены в папке 'icons/'")

if __name__ == "__main__":
    main()
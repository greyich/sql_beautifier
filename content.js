 // content.js — интеграция с веб-страницами
(function() {
    if (!window.SQLFormatter) return;
    document.addEventListener('contextmenu', function(e) {
        const sel = window.getSelection().toString().trim();
        if (sel && /select|insert|update|delete|from|where|join/i.test(sel)) {
            // Можно добавить кастомное меню, но Chrome API не позволяет просто так
            // Поэтому покажем alert с форматированием (демо)
            setTimeout(() => {
                if (confirm('Форматировать выделенный SQL?')) {
                    const f = new window.SQLFormatter();
                    alert(f.format(sel));
                }
            }, 10);
        }
    });
})();
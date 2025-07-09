// popup.js — логика popup-интерфейса SQL Beautifier
class PopupController {
    constructor() {
        this.formatter = new SQLFormatter();
        this.sqlInput = document.getElementById('sql-input');
        this.sqlOutput = document.getElementById('sql-output');
        this.pasteBtn = document.getElementById('paste-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.copyBtn = document.getElementById('copy-btn');
        this.bindEvents();
        this.formatSQL(); // начальное форматирование
    }
    
    bindEvents() {
        // Автоформатирование при любом изменении
        this.sqlInput.addEventListener('input', () => this.formatSQL());
        
        // Вставка из буфера обмена
        this.pasteBtn.onclick = async () => {
            try {
                const text = await navigator.clipboard.readText();
                this.sqlInput.value = text;
                this.formatSQL();
            } catch (err) {
                this.showNotification('Не удалось получить данные из буфера обмена: ' + err);
            }
        };
        
        this.clearBtn.onclick = () => { 
            this.sqlInput.value = ''; 
            this.sqlOutput.value = ''; 
        };
        this.copyBtn.onclick = () => {
            if (!this.sqlOutput.value) return;
            navigator.clipboard.writeText(this.sqlOutput.value).then(() => this.showNotification('Скопировано!'));
        };
    }
    
    formatSQL() {
        const sql = this.sqlInput.value.trim();
        if (!sql) {
            this.sqlOutput.value = '';
            return;
        }
        this.sqlOutput.value = this.formatter.format(sql);
    }
    
    showNotification(msg) {
        let n = document.createElement('div');
        n.className = 'notification';
        n.textContent = msg;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => new PopupController());
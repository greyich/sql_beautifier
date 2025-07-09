// SQL Formatter — простой форматтер SQL для расширения Chrome
class SQLFormatter {
    constructor() {
        this.keywords = [
            'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
            'TABLE', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER', 'DATABASE', 'SCHEMA',
            'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS', 'FULL', 'ON', 'AND', 'OR', 'NOT',
            'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'ORDER', 'BY', 'GROUP', 'HAVING',
            'UNION', 'ALL', 'DISTINCT', 'TOP', 'LIMIT', 'OFFSET', 'AS', 'CASE', 'WHEN', 'THEN',
            'ELSE', 'END', 'IF', 'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'GRANT', 'REVOKE',
            'PRIMARY', 'FOREIGN', 'KEY', 'CONSTRAINT', 'DEFAULT', 'CHECK', 'UNIQUE', 'INDEX',
            'ASC', 'DESC', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'COALESCE', 'NULLIF', 'CAST',
            'CONVERT', 'GETDATE', 'NOW', 'CURRENT_TIMESTAMP', 'DATE', 'DATETIME', 'VARCHAR',
            'INT', 'BIGINT', 'DECIMAL', 'FLOAT', 'DOUBLE', 'BOOLEAN', 'TEXT', 'BLOB'
        ];
    }
    
    format(sql, options = {}) {
        if (!sql || typeof sql !== 'string') return '';
        
        // Очищаем SQL
        let formatted = sql.replace(/\s+/g, ' ')
                           .replace(/\s*([,()])\s*/g, '$1 ')
                           .replace(/\s*([=<>!+\-*/%])\s*/g, ' $1 ')
                           .trim();
        
        // Разбиваем на токены
        const tokens = this.tokenize(formatted);
        
        // Форматируем
        return this.formatTokens(tokens);
    }
    
    tokenize(sql) {
        const tokens = [];
        let current = '';
        let inString = false;
        let stringChar = '';
        
        for (let i = 0; i < sql.length; i++) {
            const char = sql[i];
            
            // Обработка строк
            if (!inString && (char === "'" || char === '"')) {
                inString = true;
                stringChar = char;
                if (current) {
                    tokens.push({ type: 'word', value: current.trim() });
                    current = '';
                }
                current = char;
                continue;
            }
            
            if (inString) {
                current += char;
                if (char === stringChar && sql[i - 1] !== '\\') {
                    inString = false;
                    tokens.push({ type: 'string', value: current });
                    current = '';
                }
                continue;
            }
            
            // Обработка разделителей
            if (char === ' ' || char === '\t' || char === '\n') {
                if (current) {
                    tokens.push({ type: 'word', value: current.trim() });
                    current = '';
                }
                continue;
            }
            
            // Обработка специальных символов
            if (['(', ')', ',', ';', '='].includes(char)) {
                if (current) {
                    tokens.push({ type: 'word', value: current.trim() });
                    current = '';
                }
                tokens.push({ type: 'symbol', value: char });
                continue;
            }
            
            current += char;
        }
        
        if (current) {
            tokens.push({ type: 'word', value: current.trim() });
        }
        
        return tokens;
    }
    
    formatTokens(tokens) {
        let result = '';
        let indent = 0;
        let inSelect = false;
        let inInsert = false;
        let inUpdate = false;
        let inDelete = false;
        let inFields = false;
        let fieldCount = 0;
        
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const nextToken = tokens[i + 1];
            let value = token.value;
            
            // Обработка ключевых слов
            if (token.type === 'word' && this.isKeyword(value.toUpperCase())) {
                const upperValue = value.toUpperCase();
                value = upperValue; // Всегда в верхнем регистре
                
                // Управление состоянием
                if (upperValue === 'SELECT') {
                    inSelect = true;
                    inInsert = false;
                    inUpdate = false;
                    inDelete = false;
                    inFields = true;
                    fieldCount = 0;
                } else if (upperValue === 'INSERT') {
                    inSelect = false;
                    inInsert = true;
                    inUpdate = false;
                    inDelete = false;
                    inFields = false;
                } else if (upperValue === 'UPDATE') {
                    inSelect = false;
                    inInsert = false;
                    inUpdate = true;
                    inDelete = false;
                    inFields = false;
                } else if (upperValue === 'DELETE') {
                    inSelect = false;
                    inInsert = false;
                    inUpdate = false;
                    inDelete = true;
                    inFields = false;
                } else if (['FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET'].includes(upperValue)) {
                    inFields = false;
                    inSelect = false;
                    inInsert = false;
                    inUpdate = false;
                    inDelete = false;
                }
                
                // Перенос строки для основных ключевых слов
                if (['FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS', 'FULL'].includes(upperValue)) {
                    result += '\n' + ' '.repeat(indent * 4);
                }
            }
            
            // Обработка символов
            if (token.type === 'symbol') {
                if (value === '(') {
                    indent++;
                    if (inFields && fieldCount > 0) {
                        result += '\n' + ' '.repeat(indent * 4);
                    }
                } else if (value === ')') {
                    indent = Math.max(0, indent - 1);
                } else if (value === ',') {
                    // Специальная обработка для полей в SELECT
                    if (inFields && inSelect) {
                        result += ',\n' + ' '.repeat((indent + 1) * 4);
                        fieldCount++;
                        continue;
                    }
                    // Обычная обработка запятых
                    result += ',\n' + ' '.repeat((indent + 1) * 4);
                    continue;
                }
            }
            
            // Добавляем отступ в начале строки
            if (result && result.endsWith('\n')) {
                result += ' '.repeat(indent * 4);
            }
            
            // Добавляем пробел перед токеном (кроме начала строки)
            if (result && !result.endsWith('\n') && !result.endsWith(' ') && !['(', ',', ';'].includes(value)) {
                result += ' ';
            }
            
            result += value;
            
            // Перенос строки после SELECT
            if (token.type === 'word' && value.toUpperCase() === 'SELECT') {
                result += '\n' + ' '.repeat((indent + 1) * 4);
            }
            
            // Перенос строки после точки с запятой
            if (value === ';') {
                result += '\n';
            }
        }
        
        return result.replace(/^\s+|\s+$/g, '').replace(/\n{2,}/g, '\n');
    }
    
    isKeyword(word) {
        return this.keywords.includes(word.toUpperCase());
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SQLFormatter;
} else {
    window.SQLFormatter = SQLFormatter;
}
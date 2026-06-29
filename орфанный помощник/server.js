const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Путь к файлу данных
const DATA_FILE = path.join(__dirname, 'data.json');

// Функция чтения/записи данных
function readData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
        return { users: [], registry: [], reports: [], chats: {}, diaries: {}, palliatives: {}, meds: {} };
    }
}
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ============ API ============

// Получить все данные (для отладки) – только для врача?
app.get('/api/data', (req, res) => {
    res.json(readData());
});

// ===== Регистр =====
app.get('/api/registry', (req, res) => {
    res.json(readData().registry);
});
app.post('/api/registry', (req, res) => {
    const data = readData();
    data.registry.push(req.body);
    writeData(data);
    res.status(201).json({ ok: true });
});

// ===== Отчёты =====
app.get('/api/reports', (req, res) => {
    res.json(readData().reports);
});
app.post('/api/reports', (req, res) => {
    const data = readData();
    data.reports.push(req.body);
    writeData(data);
    res.status(201).json({ ok: true });
});

// ===== Дневники =====
app.get('/api/diary/:userId', (req, res) => {
    const data = readData();
    res.json(data.diaries[req.params.userId] || []);
});
app.post('/api/diary/:userId', (req, res) => {
    const data = readData();
    if (!data.diaries[req.params.userId]) data.diaries[req.params.userId] = [];
    data.diaries[req.params.userId].push(req.body);
    writeData(data);
    res.status(201).json({ ok: true });
});

// ===== Паллиатив =====
app.get('/api/palliative/:userId', (req, res) => {
    const data = readData();
    res.json(data.palliatives[req.params.userId] || []);
});
app.post('/api/palliative/:userId', (req, res) => {
    const data = readData();
    if (!data.palliatives[req.params.userId]) data.palliatives[req.params.userId] = [];
    data.palliatives[req.params.userId].push(req.body);
    writeData(data);
    res.status(201).json({ ok: true });
});

// ===== Лекарства =====
app.get('/api/meds/:userId', (req, res) => {
    const data = readData();
    res.json(data.meds[req.params.userId] || []);
});
app.post('/api/meds/:userId', (req, res) => {
    const data = readData();
    if (!data.meds[req.params.userId]) data.meds[req.params.userId] = [];
    data.meds[req.params.userId].push(req.body);
    writeData(data);
    res.status(201).json({ ok: true });
});

// ===== Чат (сообщения – глобальный) =====
app.get('/api/chat', (req, res) => {
    const data = readData();
    res.json(data.chats.global || []);
});
app.post('/api/chat', (req, res) => {
    const data = readData();
    if (!data.chats.global) data.chats.global = [];
    data.chats.global.push(req.body);
    writeData(data);
    res.status(201).json({ ok: true });
});

// ===== Аутентификация (упрощённая – без хешей, для демо) =====
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const data = readData();
    const user = data.users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });
    res.json(user);
});
app.post('/api/register', (req, res) => {
    const data = readData();
    const { username, password, role, fullName } = req.body;
    if (data.users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Логин занят' });
    }
    const user = { id: Date.now().toString(36) + Math.random().toString(36).substr(2), username, password, role, fullName, diagnosis: '', palliative: false };
    data.users.push(user);
    writeData(data);
    res.status(201).json(user);
});
app.post('/api/updateUser', (req, res) => {
    const data = readData();
    const idx = data.users.findIndex(u => u.id === req.body.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    data.users[idx] = { ...data.users[idx], ...req.body };
    writeData(data);
    res.json(data.users[idx]);
});
app.get('/api/users', (req, res) => {
    const data = readData();
    res.json(data.users);
});

// Запуск сервера
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const fs = require('fs');
const app = express();
const port = 8080; // Usado como fallback, mas o Render sobrescreve com process.env.PORT

app.use(express.json());
app.use(express.static('public'));

// Load or initialize data from files (simulated persistence)
const loadData = (file, defaultData) => {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file));
    }
    fs.writeFileSync(file, JSON.stringify(defaultData));
    return defaultData;
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
    return defaultData;
  }
};

const saveData = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving ${file}:`, error);
  }
};

let users = loadData('users.json', [
  { username: 'especialista01', email: 'especialista01@nclseguros.com.br', password: 'espec01@', isMaster: false },
  { username: 'especialista02', email: 'especialista02@nclseguros.com.br', password: 'espec02@', isMaster: false },
  { username: 'especialista03', email: 'especialista03@nclseguros.com.br', password: 'espec03@', isMaster: false },
  { username: 'especialista04', email: 'especialista04@nclseguros.com.br', password: 'espec04@', isMaster: false },
  { username: 'especialista05', email: 'especialista05@nclseguros.com.br', password: 'espec05@', isMaster: false },
  { username: 'especialista06', email: 'especialista06@nclseguros.com.br', password: 'espec06@', isMaster: false },
  { username: 'especialista07', email: 'especialista07@nclseguros.com.br', password: 'espec07@', isMaster: false },
  { username: 'especialista08', email: 'especialista08@nclseguros.com.br', password: 'espec08@', isMaster: false },
  { username: 'especialista09', email: 'especialista09@nclseguros.com.br', password: 'espec09@', isMaster: false },
  { username: 'especialista10', email: 'especialista10@nclseguros.com.br', password: 'espec10@', isMaster: false },
  { username: 'monica', email: 'monica@nacionalinvestimentos.com', password: 'Mandrake1987@@', isMaster: true },
  { username: 'silvestre', email: 'silvestre@nacionalinvestimentos.com', password: 'Mandrake1987@@', isMaster: true }
]);

let meetings = loadData('meetings.json', []);
let funnel = loadData('funnel.json', []);
let currentUser = null; // Variável global para simular sessão (ajuste em produção)

app.post('/api/register', (req, res) => {
  if (!req.body || !req.body.username || !req.body.email || !req.body.password) {
    return res.status(400).json({ error: 'Dados de registro incompletos' });
  }
  const { username, email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }
  const isMaster = email.includes('@nacionalinvestimentos.com');
  users.push({ username, email, password, isMaster });
  saveData('users.json', users);
  res.json({ message: 'Usuário cadastrado com sucesso', isMaster });
});

app.post('/api/login', (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).json({ error: 'Dados de login incompletos' });
  }
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = { username: user.username, email: user.email, isMaster: user.isMaster };
    res.json({ message: 'Login bem-sucedido', username: user.username, isMaster: user.isMaster });
  } else {
    res.status(401).json({ error: 'E-mail ou senha inválidos' });
  }
});

app.post('/api/check-session', (req, res) => {
  if (!req.body || !req.body.email) {
    return res.status(400).json({ error: 'E-mail não fornecido' });
  }
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (user && currentUser && currentUser.email === email) {
    res.json({ username: user.username, isMaster: user.isMaster });
  } else {
    res.status(401).json({ error: 'Sessão inválida' });
  }
});

app.post('/api/meetings', (req, res) => {
  if (!currentUser || !currentUser.isMaster) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (!req.body || !req.body.userEmail || !req.body.date) {
    return res.status(400).json({ error: 'Dados da reunião incompletos' });
  }
  const meeting = { ...req.body, id: Date.now(), userEmail: currentUser.email };
  meetings.push(meeting);
  saveData('meetings.json', meetings);
  res.json({ message: 'Reunião agendada com sucesso' });
});

app.get('/api/meetings/:email', (req, res) => {
  const email = req.params.email;
  const userMeetings = meetings.filter(m => m.userEmail === email);
  res.json(userMeetings);
});

app.post('/api/funnel', (req, res) => {
  if (!currentUser || !currentUser.isMaster) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (!req.body || !req.body.clientName || !req.body.stage) {
    return res.status(400).json({ error: 'Dados da oportunidade incompletos' });
  }
  const opportunity = { ...req.body, id: Date.now(), userEmail: currentUser.email };
  funnel.push(opportunity);
  saveData('funnel.json', funnel);
  res.json({ message: 'Oportunidade adicionada com sucesso' });
});

app.get('/api/funnel/:email', (req, res) => {
  const email = req.params.email;
  const userFunnel = funnel.filter(f => f.userEmail === email);
  res.json(userFunnel);
});

app.put('/api/funnel/:id', (req, res) => {
  if (!currentUser || !currentUser.isMaster) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (!req.body || !req.body.stage) {
    return res.status(400).json({ error: 'Etapa não fornecida' });
  }
  const id = parseInt(req.params.id);
  const { stage } = req.body;
  const opportunity = funnel.find(f => f.id === id);
  if (opportunity) {
    opportunity.stage = stage;
    saveData('funnel.json', funnel);
    res.json({ message: 'Etapa atualizada com sucesso' });
  } else {
    res.status(404).json({ error: 'Oportunidade não encontrada' });
  }
});

app.listen(process.env.PORT || 8080, '0.0.0.0', () => {
  console.log(`Server running on port ${process.env.PORT || 8080}`);
});
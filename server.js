const express = require('express');
const fs = require('fs');
const app = express();
const port = 8080;

app.use(express.json());
app.use(express.static('public'));

// Simulated user database (replace with a proper database in production)
let users = [
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
];

let meetings = [];
let funnel = [];

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }
  const isMaster = email.includes('@nacionalinvestimentos.com');
  users.push({ username, email, password, isMaster });
  res.json({ message: 'Usuário cadastrado com sucesso', isMaster });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ message: 'Login bem-sucedido', username: user.username, isMaster: user.isMaster });
  } else {
    res.status(401).json({ error: 'E-mail ou senha inválidos' });
  }
});

app.post('/api/check-session', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (user) {
    res.json({ username: user.username, isMaster: user.isMaster });
  } else {
    res.status(401).json({ error: 'Sessão inválida' });
  }
});

app.post('/api/meetings', (req, res) => {
  if (!currentUser || !currentUser.isMaster) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const meeting = { ...req.body, id: Date.now() };
  meetings.push(meeting);
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
  const opportunity = { ...req.body, id: Date.now() };
  funnel.push(opportunity);
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
  const id = parseInt(req.params.id);
  const { stage } = req.body;
  const opportunity = funnel.find(f => f.id === id);
  if (opportunity) {
    opportunity.stage = stage;
    res.json({ message: 'Etapa atualizada com sucesso' });
  } else {
    res.status(404).json({ error: 'Oportunidade não encontrada' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://189.100.70.46:${port}`);
});
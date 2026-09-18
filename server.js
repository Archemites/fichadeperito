const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let db;
let client;

async function connectDB() {
  if (db) return db;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('fichas_perito');
    console.log('✅ Conectado com sucesso ao MongoDB Atlas (banco: fichas_perito)!');
    return db;
  } catch (err) {
    console.error('❌ Erro de conexão com MongoDB Atlas:', err);
    throw err;
  }
}

// --------------------------------------------------------------------------
// ENDPOINTS DE USUÁRIOS (Tabela/Coleção: `usuarios`)
// --------------------------------------------------------------------------

// Listar todos os usuários cadastrados (para login / seleção de conta)
app.get('/api/users', async (req, res) => {
  try {
    const database = await connectDB();
    const usersCollection = database.collection('usuarios');
    const users = await usersCollection.find({}).sort({ username: 1 }).toArray();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cadastrar ou Entrar com Usuário (Garante registro na tabela `usuarios`)
app.post('/api/users/login', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, error: 'Nome de usuário é obrigatório.' });
    }

    const cleanUsername = username.trim();
    const database = await connectDB();
    const usersCollection = database.collection('usuarios');

    let user = await usersCollection.findOne({ username: cleanUsername });
    if (!user) {
      const result = await usersCollection.insertOne({
        username: cleanUsername,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      user = { _id: result.insertedId, username: cleanUsername };
    } else {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { updatedAt: new Date() } }
      );
    }

    res.json({
      success: true,
      user: { id: user._id.toString(), username: user.username }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// --------------------------------------------------------------------------
// ENDPOINTS DE PERITOS (Tabela/Coleção: `peritos`)
// Cada perito pertence a um usuário (userId / username)
// --------------------------------------------------------------------------

// Listar todos os peritos criados por um determinado usuário
app.get('/api/users/:username/peritos', async (req, res) => {
  try {
    const { username } = req.params;
    const database = await connectDB();
    const peritosCollection = database.collection('peritos');

    const peritos = await peritosCollection
      .find({ username: username.trim() })
      .sort({ updatedAt: -1 })
      .toArray();

    res.json({ success: true, peritos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar TODOS os peritos de TODOS os usuários (exclusivo para Mestre / MESTRALYSSA)
app.get('/api/peritos/all', async (req, res) => {
  try {
    const database = await connectDB();
    const peritosCollection = database.collection('peritos');

    const peritos = await peritosCollection
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    res.json({ success: true, peritos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter dados de um perito específico por peritoId
app.get('/api/peritos/:peritoId', async (req, res) => {
  try {
    const { peritoId } = req.params;
    const database = await connectDB();
    const peritosCollection = database.collection('peritos');

    let peritoDoc = null;
    if (ObjectId.isValid(peritoId)) {
      peritoDoc = await peritosCollection.findOne({ _id: new ObjectId(peritoId) });
    }
    if (!peritoDoc) {
      peritoDoc = await peritosCollection.findOne({ _id: peritoId });
    }

    if (!peritoDoc) {
      return res.status(404).json({ success: false, error: 'Perito não encontrado.' });
    }

    res.json({ success: true, perito: peritoDoc });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Criar ou Salvar Ficha de um Perito na tabela `peritos`
app.post('/api/peritos/save', async (req, res) => {
  try {
    const { peritoId, username, ficha } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, error: 'Nome de usuário não informado.' });
    }

    if (!ficha || !ficha.nome || !ficha.nome.trim()) {
      return res.status(400).json({ success: false, error: 'O Nome do Perito é obrigatório.' });
    }

    const database = await connectDB();
    const peritosCollection = database.collection('peritos');
    const now = new Date();

    let targetId = peritoId;
    let queryFilter;

    if (targetId && ObjectId.isValid(targetId)) {
      queryFilter = { _id: new ObjectId(targetId) };
    } else if (targetId) {
      queryFilter = { _id: targetId };
    } else {
      // Se não enviou peritoId, cria novo documento
      const newDoc = {
        username: username.trim(),
        nomePerito: ficha.nome.trim(),
        profissao: ficha.profissao || '',
        nivel: ficha.nivel || 1,
        fichaData: ficha,
        createdAt: now,
        updatedAt: now
      };
      const result = await peritosCollection.insertOne(newDoc);
      return res.json({
        success: true,
        message: 'Novo perito criado e salvo com sucesso!',
        peritoId: result.insertedId.toString(),
        savedAt: now
      });
    }

    // Atualiza perito existente
    await peritosCollection.updateOne(
      queryFilter,
      {
        $set: {
          username: username.trim(),
          nomePerito: ficha.nome.trim(),
          profissao: ficha.profissao || '',
          nivel: ficha.nivel || 1,
          fichaData: ficha,
          updatedAt: now
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Ficha do perito salva com sucesso!',
      peritoId: targetId.toString(),
      savedAt: now
    });
  } catch (error) {
    console.error('Erro ao salvar perito:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deletar um perito
app.delete('/api/peritos/:peritoId', async (req, res) => {
  try {
    const { peritoId } = req.params;
    const database = await connectDB();
    const peritosCollection = database.collection('peritos');

    let queryFilter;
    if (ObjectId.isValid(peritoId)) {
      queryFilter = { _id: new ObjectId(peritoId) };
    } else {
      queryFilter = { _id: peritoId };
    }

    await peritosCollection.deleteOne(queryFilter);
    res.json({ success: true, message: 'Perito removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  connectDB().catch(() => {});
});

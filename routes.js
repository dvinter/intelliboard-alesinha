const express = require('express');
const passport = require('passport');
const routes = new express.Router();
const jwt = require('jsonwebtoken');
const Atendimentos = require('./mongodb/models/Atendimento')
const AtendimentoController = require('./mongodb/controllers/AtendimentoController');

routes.post('/login', passport.authenticate('local'), (req, res) => {
    let token = jwt.sign({email: req.user.email},
        process.env.jwtKey,
        { expiresIn: '24h' }
    );
    // return the JWT token for the future API calls
    res.header('Authorization', `Bearer ${token}`);

    res.sendStatus(204);
});

routes.post('/conversation/add', async (req, res) => {
    const { msg, id, context, misunderstood } = req.body;
    const infos = {
        text: msg,
        date: new Date(),
        context: JSON.stringify(context),
        misunderstood: misunderstood || false
    }

    let room = await Atendimentos.findOne({ conversationId: id });
    if(!room) room = await new Atendimentos({ conversationId: id, messages: []});

    room.messages.push(infos);

    room.markModified('messages');
    room.save();

    res.sendStatus(200);
});

routes.post('/conversation/rate', async (req, res) => {
    const { id, rate } = req.body;

    let atendimento = await Atendimentos.findOne({ conversationId: id })
    if (!atendimento) return res.status(400).send('No conversation found for id ' + id);
    if (rate != 'GOOD' && rate != 'BAD') return res.status(400).send('Invalid rate value');

    atendimento.rating = rate;

    atendimento.markModified('rating');
    atendimento.save();

    res.sendStatus(200);
});

routes.post('/conversation/observation', async (req, res) => {
    const { id, observation } = req.body;

    let atendimento = await Atendimentos.findOne({ conversationId: id })
    if (!atendimento) return res.status(400).send('No conversation found for id ' + id);

    atendimento.observations = observation;
    atendimento.markModified('observations');
    atendimento.save();

    res.sendStatus(200);
})

// todas as rotas daqui pra baixo passarão por autenticação pelo token
routes.use(passport.authenticate('jwt', { session: true }));

routes.get('/atendimentos', async (req, res) => {
    const atendimentos = await AtendimentoController.getAtendimentos(req.query.dataInicio, req.query.dataFim);
    res.send(atendimentos);
})

routes.get('/conversation/:id', async (req, res) => {
    const { id } = req.params;
    const atendimento = await AtendimentoController.find(id);
    res.send(atendimento);
})

routes.post('/atendimentos/:id/review', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    

    let atendimento = await Atendimentos.findOne({ _id: id })
    if (!atendimento) return res.status(400).send('No conversation found for id ' + id);
    if (status != false && status != true) return res.status(400).send('Invalid status value');

    atendimento.reviewed = status;
    atendimento.markModified('reviewed');
    atendimento.save();

    res.sendStatus(200);
})

module.exports = routes;
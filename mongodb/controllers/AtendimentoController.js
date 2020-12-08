const Atendimento = require('../models/Atendimento');
const moment = require('moment');

Atendimento.update({ classId: null });

module.exports = {
  async getAtendimentos(dataInicio, dataFim) {
    let inicio = moment(new Date(dataInicio), 'America/Sao_Paulo');
    let fim = moment(new Date(dataFim), 'America/Sao_Paulo');
    const atendimentos = await Atendimento.find(
      {
        createdAt: {
          $gte: inicio.startOf('day').toDate(),
          $lte: fim.endOf('day').toDate(),
        },
      },
      { _id: 1, messages: 1, createdAt: 1, reviewed: 1,  rating: 1, observations: 1},
      { sort: { createdAt: 1 } }
    )
      .lean()
      .then((atendimentos) => {
        atendimentos = atendimentos.map((e) => {
          e.hasMisunderstood =
            e.messages && e.messages.some((m) => m.misunderstood);
          try {
            const context = JSON.parse(e.messages[1].context);
            e.nome = context.nome === 'undefined'?'':context.nome;
            e.matricula = context.matricula === 'undefined'?'':context.matricula;
          } catch (e) {}
          e.messages = undefined;
          if(e.rating === 'GOOD') e.rating = 'Positivo'
          else if(e.rating === 'BAD') e.rating = 'Negativo'
          else e.rating = ''
          return e;
        });

        return atendimentos;
      })
      .catch((err) => console.error(err));

    return atendimentos;
  },
  async find(id) {
    return new Promise((resolve) => {
      Atendimento.findById(id).exec(function (err, atendimento) {
        if (err) return console.error(err);
        resolve(atendimento);
      });
    });
  },
};

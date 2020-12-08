const Survey = require('../models/Survey');

module.exports = {
    async find(id) {
        const value = await Survey.findById(id);

        return value;
    },
    async create(infos) {
        const { userId, connectionId, context, phone, name, cardId } = infos;

        const classRoom = await Survey.create({
            userId,
            connectionId,
            context,
            phone,
            name,
            cardId
        });

        return classRoom;
    }
};
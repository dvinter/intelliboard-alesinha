const mongoose = require('mongoose');

const url = process.env.mongoDBStringConnection;

function connect () {
	mongoose.connect(url, { 
		keepAlive: true,
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true 
	});

	const db = mongoose.connection;
	db.once('open', _ => {
		console.log('Database connected:', url)
	});

	db.on('error', err => {
		console.error('Connection error:', err)
	});
}

module.exports = { connect }
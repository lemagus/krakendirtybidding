const moment = require('moment');

require('dotenv').config();

const url =  process.env.DB_HOST + ':27017/crypto'; // Connection URL
const db = require('monk')(url);
const balances = db.get('balances');

const express = require('express');
const port = 8080;

const app = express();
app.engine('ejs', require('ejs-locals'));

const average = (from, to, callback) => {
	
	console.log(process.env.DB_HOST + ':27017/crypto');
	balances.find( { date: { $gte : from}, date: { $lt : to }  }).then((doc) => {
		console.log(doc)	
	})
}

app.get('/:period?', function(req, res) {
	
	var from, to;
	
	switch(req.params.period) {
		case undefined:
		case 'today':
		
			from = parseInt(moment().format("YYYYMMDD") + '00');
			to = parseInt(moment().add(1, 'days').format("YYYYMMDD") + '00');
		
			break;
		case 'yesterday':
		
			from = parseInt(moment().add(-1, 'days').format("YYYYMMDD") + '00');
			to = parseInt(moment().format("YYYYMMDD") + '00');
		
			break;
	}
	
	average(from, to);
	
    res.render('index.ejs', {});
});

app.listen(port);

console.log('Listening on port %d', port);
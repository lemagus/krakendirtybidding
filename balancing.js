const fetch = require('node-fetch');
const fs = require('fs');

const moment = require('moment');

const url = 'localhost:27017/crypto'; // Connection URL
const db = require('monk')(url);

const balances = db.get('balances');

const currencies = JSON.parse(fs.readFileSync(__dirname + '/datas/currencies.json'));

async function init(){
	for(let currency of currencies){

		fetch('https://api.cryptonator.com/api/ticker/' + currency.code.toLowerCase() + '-eur')
			.then(function(res){
				return res.json();
			})
			.then(function(json){
				if(json.success) {
					
					currency.date = moment().format("YYYYMMDDHH");
					currency.min = parseFloat(json.ticker.price);
					currency.max = parseFloat(json.ticker.price);
					currency.diff = currency.max - currency.min;
					currency.changes = { min: 0, max: 0 };
					
					balances.findOne( { date: currency.date, code: currency.code  }).then((doc) => {
						if(doc == null){
							balances.insert(currency);
						} else {
							
							let newMin = Math.min(currency.min, doc.min);
							let newMax = Math.max(currency.max, doc.max);
						
							currency.changes = {
								min: currency.min != newMin ? doc.changes.min +1 : doc.changes.min,
								max: currency.max != newMax ? doc.changes.max +1 : doc.changes.max
							};
							
							currency.min 	= newMin;
							currency.max 	= newMax;
							
							currency.diff 	= currency.max - currency.min;
							
							balances.update({ _id: doc._id  }, currency);
						}
						
						console.log(doc);
					}) 
				}
			});
		await sleep(1000)
	}
}

function sleep(ms){
    return new Promise( resolve => {
        setTimeout(resolve,ms)
    })
}

setInterval(init, 1000 * 60 * 5 );
init();
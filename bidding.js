const trades = {
	'XXBT' : {
		buy: 10000, // When to boy BTC
		sell: 12000, // When to sell BTC
		max: 900 // Max to spend in euro
	}
};

const mapping = {
	'XXBT' : 'BTC'
};

const loopTime = 10;

require('dotenv').config();

const minOrder = {	
	REP: 0.3,
	XBT: 0.002,
	BCH: 0.002,
	DASH: 0.03,
	DOGE: 3000,
	EOS: 3,
	ETH: 0.02,
	ETC: 0.3,
	GNO: 0.03,
	ICN: 2,
	LTC: 0.1,
	MLN: 0.1,
	XMR: 0.1,
	XRP: 30,
	XLM: 300,
	ZEC: 0.03,
	USDT: 5
};

const fetch = require('node-fetch');

const KrakenClient = require('kraken-js-client').Kraken;
const AuthOpts = {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.PRIVATE_KEY
};
 
const Kraken = new KrakenClient({}, AuthOpts);

const KrakenOrderClient = require('kraken-api');
const krakenAPI       	= new KrakenOrderClient(process.env.API_KEY, process.env.PRIVATE_KEY);

var loopCheck = function(){

	Kraken.Balance.get().then(function(response){
		
		if( response.error.length === 0 ) {
			
			const currencies = Object.keys(response.result);
			
			for( let currency of currencies ) {
				if( trades.hasOwnProperty(currency) && mapping.hasOwnProperty(currency) ) {
					
					let trade = trades[currency];
					let euros = response.result['ZEUR'];
					let curr = response.result[currency];
					
					fetch('https://api.cryptonator.com/api/ticker/' + mapping[currency].toLowerCase() + '-eur')
						.then(function(res){
							return res.json();
						})
						.then(function(json){
							if(json.success) {
								
								let price 	= parseFloat(json.ticker.price);
								let curName = currency.substring(1).toUpperCase();
								let pair 	= curName + 'EUR';
								
								switch(true){
									case price < trade.buy:
										let amount = Math.min(euros, trade.max) / price;
										if( amount >= minOrder[curName] ) {											
											
											let params = {
												pair:pair,
												type:'buy',
												ordertype:'market',
												volume: amount 
											};
											
											try {
												krakenAPI.api('AddOrder', params, function(res){
													console.log(res);
												});
											}catch(e){
												console.log(e);
											}
											
											console.log('buying %s for €%s at %s', mapping[currency], Math.min(euros, trade.max), price);
										} else {
											
											console.log('Volume to low. Minimum required %d€', Math.round(minOrder[curName] * price) );
										}
										
										break;
									case price >= trade.sell:
										if(curr > 0) {
											
											let amount = curr;
											let params = {
												pair:pair,
												type:'sell',
												ordertype:'market',
												volume: amount 
											};
											
											try {
												krakenAPI.api('AddOrder', params, function(res){
													console.log(res);
												});
											} catch(e){
												console.log(e);
											}
											
											console.log('Selling %s%s at %s', curr, mapping[currency], price);
										}
										
										break;
								}
							}
						});
				}
			}
			
		} else {
			console.log(response.error);
		}
		
	});
	
};

setInterval(loopCheck, loopTime * 1000);
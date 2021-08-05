var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mongoose = require('mongoose');
var userdata;

/* Get member page. */
router.get('/', function(req, res, next) {
  if(req.cookies.logged){
    var uid = req.cookies.logged;
    var query = User.findOne({ '_id' : uid });
    query.select('name email money card image_url')
    query.exec(function (err, user) {
    if (err) return handleError(err);
      userdata=user;
      res.render('member', { userdata: user, title: 'member', action:'MAIN' });
    });
  } else {
    res.redirect('/login');
  }
});
router.get('/withdraw', function(req, res, next) {
  console.log("Withdraw function");
  res.render('member', { action: 'WITHDRAW', userdata: userdata, title: 'Withdraw' });
});
router.get('/deposit', function(req, res, next) {
  console.log("Deposit function");
  res.render('member', { action: 'DEPOSIT', userdata: userdata, title: 'Deposit' });
});
router.get('/logout', function(req, res, next) {
  res.clearCookie("logged");
  res.redirect('/login');
});

router.post('/transact', function(req, res, next) {
  console.log('TRANSACT WORKING');
  console.log(req.baseURL);
  console.log(next);
  
  var amount = req.body.amount;
  var card = req.body.card;
  var action = req.body.action;
  console.log(amount+' '+card+' '+action);
    if(action=='DEPOSIT'){
      var newAmount = (parseInt(amount) + parseInt(userdata.money)).toString();
      var deposit = User.updateOne(
      { 'card' : card },
      { $set: { 'money' : newAmount } }
      );
      console.log('MY HEADERS')
      console.log(req.headers)
      res.setHeader('amount', req.body.amount);
      res.setHeader('card', req.body.card);
      res.setHeader('action', req.body.action);
      if(process.env.releaseid) {
        res.setHeader('releaseid',process.env.releaseid);
      }
      console.log("Have set the headers to retrieve request-attribute");
      console.log(res.getHeaders('amount'));
      console.log(res.getHeaders('card'));
      console.log(res.getHeaders('action'));
      if(process.env.releaseid) {
        console.log(res.getHeaders('releaseid'));
        res.setHeader('releaseid',process.env.releaseid);
      }
      deposit.exec(function (err, result) {
      if (err) return handleError(err);
        console.log(result);
      });
    };
    if(action=='WITHDRAW'){
      var newAmount = parseInt(userdata.money) - parseInt(amount);
      if(newAmount<0){res.redirect('member'); return;}
      var withdraw = User.updateOne(
      { 'card' : card },
      { $set: { 'money' : newAmount } }
      );
      withdraw.exec(function (err, result) {
      if (err) return handleError(err);
        console.log(result);
      });
    };
    res.render('member', { userdata: user, title: 'member', action:'MAIN' });

});
module.exports = router;

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
	res.render('main',{
		title: 'WA Sports'//,
		//numberOfViewers : 100
	});
});

router.get('/:sports', function (req, res, next){
	res.render('games',{
		title: req.param.sports
	});
});

router.use('/admin',function(req, res, next){
	res.render('admin');
})
module.exports = router;
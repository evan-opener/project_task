var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Task = mongoose.model('Task');
//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	//allow all get request methods
	if(req.method === "GET"){
		return next();
	}
	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	return res.redirect('/#login');
};

//Register the authentication middleware
router.use('/task', isAuthenticated);

router.route('/task')
	//creates a new task
	.post(function(req, res){

		var task = new Task();
		task.text = req.body.text;
		task.created_by = req.body.created_by;
        task.pilot = req.body.pilot;
        console.log(task);
		task.save(function(err, task) {
			if (err){
				return res.send(500, err);
			}
			return res.json(task);
		});
	})
	//gets all tasks
	.get(function(req, res){
		console.log('debug1');
		Task.find(function(err, tasks){
			console.log('debug2');
			if(err){
				return res.send(500, err);
			}
			return res.send(200,tasks);
		});
	});

//task-specific commands. likely won't be used
router.route('/task/:id')
	//gets specified task
	.get(function(req, res){
		Task.findById(req.params.id, function(err, task){
			if(err)
				res.send(err);
			res.json(task);
		});
	}) 
	//updates specified task

	.put(function(req, res){
		Task.findById(req.params.id, function(err, task){
			if(err)
				res.send(err);

			task.created_by = req.body.created_by;
			task.text = req.body.text;
            task.pilot = req.body.pilot;

			task.save(function(err, task){
				if(err)
					res.send(err);

				res.json(task);
			});
		});
	})
	//deletes the task
	.delete(function(req, res) {
		Task.remove({
			_id: req.params.id
		}, function(err) {
			if (err) {
				res.send(err);
                console.log('Delete Err'); //debug d
            }
			res.json("deleted :(");
		});
	});

module.exports = router;
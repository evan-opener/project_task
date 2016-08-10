var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taskSchema = new mongoose.Schema({
    ID: String,
	created_by: String,		//should be changed to ObjectId, ref "User"
	created_at: {type: Date, default: Date.now},
	text: String,
	pilot: String
});

var userSchema = new mongoose.Schema({
	username: String,
	email: String,
	password: String, //hash created from password
	created_at: {type: Date, default: Date.now}
})


mongoose.model('Task', taskSchema);
mongoose.model('User', userSchema);

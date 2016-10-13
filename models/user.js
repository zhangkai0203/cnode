var mongoose = require('../mongdb').mongoose;

var UserSchema = new mongoose.Schema({
    name:String,
    pass:String,
    email:String
});

UserSchema.statics.getUserByinfo = function(name,email,callback){
    var cond = ['$or',{name:name}, {email:email}];
    this.find(cond, callback);
}

UserSchema.statics.addUser = function(user,callback){
    this.create(user, callback);
}

UserSchema.statics.getUser = function(name,pass,callback){
    this.findOne({name:name,pass:pass},callback);
}

module.exports = mongoose.model("User",UserSchema);
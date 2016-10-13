var mongoose = require('../mongdb').mongoose;

var replySchema = new mongoose.Schema({
    topicId:String,
    name:String,
    content:String,
    insertTime:Date
});

replySchema.statics.addReply = function(reply,callback){
    this.create(reply, callback);
}
replySchema.statics.getReplys= function(topicId,callback){
    this.find({topicId:topicId},callback);
}

module.exports = mongoose.model("reply",replySchema);
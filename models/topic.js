var mongoose = require('../mongdb').mongoose;

var TopicSchema = new mongoose.Schema({
    title:String,
    tab:String,
    content:String,
    name:String,
    insertTime:Date
});

TopicSchema.statics.addTopic = function(topic,callback){
    this.create(topic, callback);
}

TopicSchema.statics.getTopics = function(query,option,callback){
    this.find(query,{},option,callback);
}

TopicSchema.statics.getTopic = function(tid,callback){
	this.findOne({_id:tid},callback);
}

module.exports = mongoose.model("Topic",TopicSchema);
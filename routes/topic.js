var express = require('express');
var router = express.Router();
var va = require('validator');
var eventproxy = require('eventproxy');
var em = new eventproxy();
var TopicModel = require('../models/topic');
var replyModel = require('../models/reply');
var fun = require('../common/fun');
//验证用户是否登录
var auth = require('../auth/auth');

router.get('/', function(req, res, next){
    res.send("aa");
})

//详情页
router.get('/tid/:id', function(req, res, next){
    //获取请求数据
    var tid = va.trim(req.params.id);
    TopicModel.getTopic(tid,function(err,result){
        //把时间戳转换成显示时间
        result.date = fun.formatTime(result.insertTime);
        em.emit('topic_data_ok',result); 
    });
    
    replyModel.getReplys(tid, function(err,replys){
        if(replys.length != 0){
            replys.forEach(function(item){
                item.date = fun.formatTime(item.insertTime);
                //item.data = md.render(item.content);
            })
        }
        em.emit('reply_data_ok' ,replys); 
    });

    replyModel.count({topicId:tid},function(err,count){
        em.emit('reply_count_ok',count);
    })

    em.all('topic_data_ok','reply_count_ok','reply_data_ok', function(topic,count,replys){
        res.render('topic/datail',{topic:topic,count:count,replys:replys});
    });
   
});

//添加评论
router.post('/reply', auth.auth, function(req, res){
    //获取提交数据
    var topicId = req.body.topicId;
    var content = req.body.t_content;
    var name = req.session.user.name;
    //写入的数据库
    var replyData = {
        topicId:topicId,
        name:name,
        content:content,
        insertTime:Date.now()
    }
    replyModel.addReply(replyData, function(err,result){
        res.redirect('/topic/tid/'+topicId);
    });

});



//发表文章
router.get('/create',auth.auth,function(req, res, next){
    res.render('topic/create');
});

//执行提交文章
router.post('/create',function(req,res){
    //获取提交数据
    var title = va.trim(req.body.title),
        tab   = va.trim(req.body.tab),
       content= va.trim(req.body.t_content);

    //验证信息是否填完整
    var InfoEmpty = [title,tab,content].some(function(item){
        return item === '';
    })
    if(InfoEmpty){
        return res.render('topic/create',{error:"您填写的信息不完整"});
    }
    var topicDate = {
        title  :title,
        tab    :tab,
        content:content,
        name   :req.session.user.name,
     insertTime:Date.now()
    }
    TopicModel.addTopic(topicDate, function(err,result){
        if(err){
            return res.render('topic/create',{error:"填写的信息写入失败"});
        }
        return res.render('topic/create',{success:"发表话题成功！"});
    });
});


module.exports = router;

var express = require('express');
var events = require('events');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var eventproxy = require('eventproxy');
var router = express.Router();
var em = new eventproxy();
//去除左右空格
var va = require('validator');
var UserModel = require('../models/user');
var topicMdel = require('../models/topic');
var fun = require('../common/fun');

//首页
router.get('/', function(req, res, next) {

    var page = parseInt(req.query.page) || 1; 
        page = page > 0 ? page : 1;
    var tab = req.query.tab || 'all';
    var query = {};
    if(tab !== 'all'){
        query.tab = tab;
    }
    
    var count = 10;
    var option = {skip:(page-1)*count,limit:count,sort:'-insertTime'};

    topicMdel.getTopics(query,option,function(err,topics){
        topics.forEach(function(item){
            item.date = fun.formatTime(item.insertTime);
        });
        em.emit('topic_data_ok',topics);
    });
    topicMdel.count(query,function(err,counts){
        var pageCount = Math.ceil(counts/count);
        em.emit('topic_count_ok',pageCount);
    });
    em.all('topic_data_ok','topic_count_ok',function(topics,pageCount){
        res.render('index',{topics:topics, tab:tab, page:page, pageCount:pageCount});
    })
});

//登陆页
router.get('/login', function(req, res, next) {
    res.render('login/login');
});

//执行登陆
router.post('/login', function(req, res, next) {

    //获取用户数据
    var name = va.trim(req.body.name),
        pass = va.trim(req.body.pass);
    //验证信息
    if(name == "" || name == null || pass == "" || pass == null){
        return res.render('login/login',{error:"请填写的信息不完整"});
    }
    //生成口令的散列值，对密码进行加密
    var md5 = crypto.createHash('md5');
    var ps = md5.update(pass).digest('hex');
    UserModel.getUser(name,ps,function(err,user){
        if(err){
            return res.render('login/login',{error:"登录失败"});
        }
        if(user){
            req.session.user = user;
            res.redirect('/');
        }else{
            res.render('login/login',{error:'用户名或密码错误'});
        }
    });
});

//退出登录
router.get('/logout',function(req, res, next){
    //清除session
    req.session.destroy();
    res.redirect('/');
})

//注册
router.get('/reg', function(req, res, next) {
  res.render('reg/reg');
});

//执行注册
router.post('/reg', function(req, res, next) {
    //获取用户数据
    var name =  va.trim(req.body.name),
        pass =  va.trim(req.body.pass),
        repass= va.trim(req.body.repass),
        email=  va.trim(req.body.email);
    //监听事件
    em.on('error_info',function(msg){
        res.render('reg/reg',{error:msg});
    });
    //验证数据
    if(name == "" || name == null || pass == "" || pass == null || repass == "" || repass == null || email == "" || email == null){
        return em.emit('error_info','填写的信息不全');
    }
    if(pass != repass){
        return em.emit('error_info','两次密码输入的不一致');
    }
    var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if(!myreg.test(email)){
        return em.emit('error_info','输入的邮箱格式不正确');
    }
    //验证用户名或邮箱是否重复，如果不重复保存到数据库
    UserModel.getUserByinfo(name,email,function(err,users){
        if(err){
           return em.emit('error_info','获取用户信息失败');
        }
        if(users.length > 0){
           return em.emit('error_info','用户名或邮箱被占用');
        }
        //生成口令的散列值，对密码进行加密
        var md5 = crypto.createHash('md5');
        var ps = md5.update(pass).digest('hex');

        UserModel.addUser({name:name,pass:ps,email:email},function(err,result){
           if(err){
                return em.emit('error_info','写入错误');
           }
           if(result){
                res.render('reg/reg',{success:"注册成功,请登录"});
           }else{
                return em.emit('error_info','注册失败');
           }
        });
    });
});

//用户上传评论图片
router.post('/upload', function(req, res){
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype){
        var newFilename = String((new Date()).getTime())+path.extname(filename);
        var filePath = __dirname + '/../public/upload/'+ newFilename;
        var url = '/public/upload/'+newFilename;

        file.pipe(fs.createWriteStream(filePath));
        file.on('end', function(){
            res.json({success: true, url: url});
        })
    })

});

module.exports = router;

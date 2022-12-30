var express = require("express");
var bodyParser = require("body-parser");

server = express();
var fs = require("fs");

server.use(express.static("Upload"));//web root
//server.use(express.static("md110"));//web root
server.use(bodyParser.urlencoded());
server.use(bodyParser.json());

var DB = require("nedb-promises");
var ContactDB = DB.create("contact.db");
var PortfolioDB = DB.create("portfolio.db");
// PortfolioDB.insert([
//     { href: "#portfolioModal1", imgSrc: "img/portfolio/roundicons.png", title: "Round Icons", text: "Graphic Design" },
//     { href: "#portfolioModal2", imgSrc: "img/portfolio/startup-framework.png", title: "Startup Framework", text: "Website Design" },
//     { href: "#portfolioModal3", imgSrc: "img/portfolio/treehouse.png", title: "Treehouse", text: "Website Design" },
//     { href: "#portfolioModal1", imgSrc: "img/portfolio/roundicons.png", title: "Round Icons", text: "Graphic Design" },
//     { href: "#portfolioModal2", imgSrc: "img/portfolio/startup-framework.png", title: "Startup Framework", text: "Website Design" },
//     { href: "#portfolioModal3", imgSrc: "img/portfolio/treehouse.png", title: "Treehouse", text: "Website Design" }
// ])
var Games = DB.create("game.db");
Games.ensureIndex({fieldName:"id", unique:true});

//for upload
var formidable = require("formidable");
var probe = require("probe-image-size");
//var sharp=
server.set("view engine", "ejs");
server.set("views", __dirname+"/views");

server.post("/add", function(req, res){
     var form = new formidable.IncomingForm({maxFileSize: 200*1024});
     form.parse(req, function(err, fields, files){
        if(err){
            res.render("error", {error: err.message, next:"/index.html"});
        }else{
            var newGame = fields;
            newGame.players = parseInt(newGame.players);
            var ext = files.poster.originalFilename.split(".")[1];
            newGame.poster = fields.id+"."+ext;
            var posterPath = "Upload/files/"+newGame.poster;

            //check image size
            var input = fs.createReadStream(files.poster.filepath);
            probe(input).then(result=>{
                if(result.width == 800 && result.height==400){
                    //insert to DB
                    Games.update({id: newGame.id}, newGame, {upsert:true}).then(doc=>{

                    })
                    //move to upload/files
                    fs.renameSync(files.poster.filepath, posterPath);
                    res.render("success", {msg:"Uploaded succeful!", next:"/index.html", img:"files/"+newGame.poster});
                }else{
                    res.render("error", {error: "Image sizes are not 800x400", next:"/index.html"});
                }
            })
        }
     })
})

server.get("/service", function(req, res){

    Services = [
        { icon: "fa-shopping-cart", title: "E-Commerce", desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Pariatur porro laborum fuga repellat necessitatibus corporis nulla, in ex velit recusandae obcaecati maiores, doloremque quisquam similique, tempora aspernatur eligendi delectus! Rem." },
        { icon: "fa-laptop", title: "Responsive Design", desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima maxime qua architecto quo inventore harum ex magni, dicta impedit." },
        { icon: "fa-lock", title: "Web Security", desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima maxime quam architecto quo inventore harum ex magni, dicta impedit." }
    ]
    res.send(Services);
})

server.get("/portfolio", function(req, res){
    
    PortfolioDB.find({}).then(results => {
        if(results !=null){
            res.send(results);
        }else{
            res.send("Error!")
        }
    }) 
    
})



server.get("/contact", function(req, res){
    //res.send("");
    res.redirect("/BS5_Ex2 Vue.html");
});
 
server.post("/contact", function(req, res){
    console.log(req.body);
    ContactDB.insert(req.body);
    res.send();
    //res.redirect("/index.html");
})


server.listen(8000, function(){
    console.log("Server is running at port 8000!")
})
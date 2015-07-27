var app       =     require("express")();
var mysql     =     require("mysql");
var http      =     require('http').Server(app);
var io        =     require("socket.io")(http);

/* Creating POOL MySQL connection.*/

var pool = mysql.createPool({
  connectionLimit : 100,
  host     : 'localhost',
  user     : 'guildwars2',
  password : 'tyria',
  database : 'GuildWars2'
});

app.get("/",function(req,res){
    res.sendFile(__dirname + '/index.html');
});

/*  This is auto initiated event when Client connects to Your Machine.  */

io.on('connection',function(socket){  
   console.log("A user is connected");
   io.emit('guild list',function (data){
      pool.getConnection(function(err,connection){
         if (err) {
            console.log("connection error");
            connection.release();
            return;
         }
         connection.query("SELECT g.guild_name, "+
                          "       g.tag, "+
                          "       e.background_id, "+
                          "       e.foreground_id, "+
                          "       e.background_color_id, "+
                          "       e.foreground_primary_color_id, "+
                          "       e.foreground_secondary_color_id, "+
                          "       e.flags "+
                          "FROM guilds g "+
                          "JOIN guild_emblem_flags e "+
                          "ON g.flag_id = e.id "), function(err, rows) {
                          console.log(rows);
            connection.release();
            if(!err) {
               console.log(JSON.parse(rows));
               data = JSON.parse(rows);
               return data;
            }
         };
         connection.on('error',function(err){
            console.log("error in select");
            return;
         });
      });
   });
});

http.listen(3000,function(){
    console.log("Listening on 3000");
});
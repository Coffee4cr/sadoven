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


//Define/initialize our global
var guilds = [];
var isInitGuilds = false;
var socketCount = 0;

/*  This is auto initiated event when Client connects to Your Machine.  */

io.on('connection',function(socket){  
   //Socket has connected, increase count
   socketCount++;
   console.log("A user is connected -- Total users: "+socketCount);
   
   io.on('disconnect',function(){
      //Decrease socket count
      socketCount--;
      console.log('A user disconnected -- Total users: ' +socketCount);
   });
   
   if (!isInitGuilds) {
      //initial app start, get guilds
      pool.getConnection(function(err,connection){
         if (err) {
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
                          "       e.flags, "+
                          "       e.id "+
                          "FROM guilds g "+
                          "JOIN guild_emblem_flags e "+
                          "ON g.flag_id = e.id ")
                  .on('result', function(data){
                     guilds.push(data);
                  })
                  .on('end',function(){
                     io.emit('init guilds',guilds);
                     isInitGuilds = true;
                  });
      });
   } else {
      //Initial Notes already Exist
      //io.emit('init guilds',guilds);
      return;
   }
});
http.listen(3000,function(){
    console.log("Listening on 3000");
});
var mysql = require("mysql");

var DBpassword = process.argv[3];
var pool = mysql.createPool({
  host: "localhost",
  user: "admin",
  password: DBpassword,
  database: "Discord",
  queueLimit: 0, // unlimited queueing
  connectionLimit: 0, // unlimited connections
  multipleStatements: true, // I like this because it helps prevent nested sql statements, it can be buggy though, so be careful
  socketPath: "/var/lib/mysql/mysql.sock"
});

function connect() {
  pool.getConnection(function(err, conn) {
    if (err) return console.log(err);
    //return conn; // Xef - Why?
  });
}

function endConnect(connection) {
  // stop... IT'S END CONNECTION?! FOR WHAT?!
  connection.release(function(err) {
    if (err) throw err;
    console.log("A connection is closed:)");
  });
}

function select(table, col, value, resolve) {
  //let connection = connect(); // Xef - Why?
  pool.getConnection(function(err, conn) {
    if (err) return console.log(err);
    //return conn; // Xef - Why?
    conn.query(`SELECT * FROM ${table} WHERE ${col} = '${value}'`, function(
      err,
      result,
      fields // TODO select ${STH} from
    ) {
      if (err) throw err;
      console.log(result);
      endConnect(conn);
      var json;
      result.forEach(function(row) {
        console.log(row);
        let string = JSON.stringify(row);
        console.log(string);
        json = JSON.parse(string);
        console.log(json);
        resolve(json);
        return json;
      });      
    });
  });
}

function get_giuld_settings(guild) {
  new Promise(function(resolve) {
    console.log("Start promise");
    select("settings", "guild_id", guild.id, resolve);
    console.log("End");
  }).then(function(settings) {
    console.log("Getted settings:");
    console.log(settings);
    if (!(typeof settings == "undefined")) {
      // if setting is not empty
      console.log("Send settings:");
      return settings;
    } else {
      console.log("New guild");
      insert("settings", "`guild_id`", guild.id); // Add the settings
      return select("settings", "guild_id", guild.id); // return one
    }
  });
}

function insert(table, column, value) {
  let columns;
  if (Object.prototype.toString.call(column) === "[object Array]") {
    // if column == array => columns = "column1, column2..."
    for (i = 0; i != column.length; i++) {
      columns += column[i] + ", ";
    }
    columns += column[-0]; // columns = "... column5, column6 (w/o ',')"
  } else {
    columns = column;
  } // else columns == column

  let values;
  if (Object.prototype.toString.call(value) === "[object Array]") {
    //Same
    for (i = 0; i != value.length; i++) {
      values += value[i] + ", ";
    }
    values += value[-0];
  } else {
    values = value;
  }

  //let connection = connect();
  pool.getConnection(function(err, conn) {
    if (err) return console.log(err);
    //return conn;
    conn.query(`INSERT INTO ${table} (${columns}) values (${values})`, function(
      err,
      result,
      fields
    ) {
      if (err) throw err;
      endConnect(conn);
      console.log(err);
    });
  });
}

function update(table, column, value) {
  let updateString;
  if (Object.prototype.toString.call(column) === "[object Array]") {
    // as in the function insert
    for (i = 0; i != column.length; i++) {
      updateString += column[i] + "=" + value[i] + ", ";
    }
    updateString += column[-0] + "=" + value[-0];
  } else updateString += column + "=" + value;

  //let connection = connect();
  pool.getConnection(function(err, conn) {
    if (err) return console.log(err);
    //return conn;

    conn.query(`UPDATE ${table} SET ${updateString}`, function(
      err,
      result,
      fields
    ) {
      if (err) throw err;
      endConnect(connection);
    });
  });
}

exports.get_giuld_settings = get_giuld_settings;

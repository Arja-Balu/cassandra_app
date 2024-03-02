const express = require('express');
const bodyParser = require('body-parser');
const cassandra = require('cassandra-driver');

const app = express();
const port = 3000;

// Cassandra setup
const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  keyspace: 'testingout'
});

client.connect(function(err, result) {
  if (err) {
    console.error('Error connecting to Cassandra:', err);
  } else {
    console.log('Connected to Cassandra');
  }
});

// Express middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());

// GET routes for rendering the registration and login forms
app.get('/register', function(req, res) {
  res.sendFile(__dirname + '/public/register.html');
});

app.get('/login', function(req, res) {
  res.sendFile(__dirname + '/public/login.html');
});
// Routes
app.post('/register', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const query = 'INSERT INTO user (username, password) VALUES (?, ?)';
  client.execute(query, [username, password], { prepare: true }, function(err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send('User registered successfully');
    }
  });
});

app.post('/login', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const query = 'SELECT * FROM user WHERE username = ?';
  client.execute(query, [username], { prepare: true }, function(err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (result.rows.length === 0) {
        res.status(401).send('User not found');
      } else {
        const user = result.rows[0];
        if (user.password === password) {
          res.status(200).send('Login successful');
          res.redirect('/home/vitcse/Downloads/balu cassandra/public/dash.html');
        } else {
          res.status(401).send('Incorrect password');
        }
      }
    }
  });
});

// Start the server
app.listen(port, function() {
  console.log(`Server is running on http://localhost:${port}`);
});

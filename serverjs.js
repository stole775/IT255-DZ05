const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 8080;

app.use(bodyParser.json());

const basicAuth = require('express-basic-auth'); 

const users = {
    'username': 'password', 

  };
  
  const basicAuthMiddleware = basicAuth({
    users,
    challenge: true,  
  });
   
  app.use('/api', basicAuthMiddleware);  


 
const dataFilePath = 'baza.json';

//  http://username:password@localhost:8080/api/get
app.get('/api/get', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Neuspesno citanje' });
            return;
        }

        res.json(JSON.parse(data));
    });
});

//http://username:password@localhost:8080/api/get/2
app.get('/api/get/:id', (req, res) => {
    const resourceId = req.params.id;//uzima id iz zahteva

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Neuspesno citanje' });
            return;
        }

        const resources = JSON.parse(data);
        const resource = resources.find((r) => r.id == resourceId);

        if (!resource) {
            res.status(404).json({ error: 'Nema resursa sa tim id-jem' });
            return;
        }

        res.json(resource);
    });
});

//mora preko postmana da se posalje json ima slika u folderu http://username:password@localhost:8080/api/dodaj
app.post('/api/dodaj', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Neuspesno citanje' });
            return;
        }

        const resources = JSON.parse(data);
        const newResource = req.body;
        console.log(newResource);
        newResource.id = resources.length + 1;
        resources.push(newResource);

        fs.writeFile(dataFilePath, JSON.stringify(resources, null, 2), (err) => {
            if (err) {
                res.status(500).json({ error: 'Neuspesno upisivanje' });
                return;
            }

            // odgovor
            res.status(201).json(newResource);
        });
    });
});
 

// mora preko postmana http://username:password@localhost:8080/api/azuriranje/2
app.put('/api/azuriranje/:id', (req, res) => {
    const resourceId = req.params.id;

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Neuspesno citanje' });
            return;
        }

        const resources = JSON.parse(data);
        const resourceIndex = resources.findIndex((r) => r.id == resourceId);

        if (resourceIndex === -1) {
            res.status(404).json({ error: 'Nema resursa sa tim id-jem' });
            return;
        }

        resources[resourceIndex] = req.body;

        fs.writeFile(dataFilePath, JSON.stringify(resources, null, 2), (err) => {
            if (err) {
                res.status(500).json({ error: 'Neuspesno upisivanje' });
                return;
            }

            res.json(resources[resourceIndex]);
        });
    });
});

//   http://localhost:8080/obrisi/5 samo on nema autorizaciju jer ima neki bug 
app.delete('/obrisi/:id', (req, res) => {
    const resourceId = req.params.id;

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Neuspesno citanje' });
            return;
        }

        const resources = JSON.parse(data);
        const resourceIndex = resources.findIndex((r) => r.id == resourceId);

        if (resourceIndex === -1) {
            res.status(404).json({ error: 'Nema resursa sa tim id-jem' });
            return;
        }

        resources.splice(resourceIndex, 1);

        fs.writeFile(dataFilePath, JSON.stringify(resources, null, 2), (err) => {
            if (err) {
                res.status(500).json({ error: 'Neuspesno upisivanje' });
                return;
            }

            res.json({ message: 'Resurs je obrisan' });
        });
    });
});

app.listen(port, () => {
    console.log(`Server je pokrenut na portu ${port}`);
});

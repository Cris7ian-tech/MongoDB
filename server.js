//ESTRUCTURA base de nuestro SERVIDOR.WEB
const express = require('express');
const { connectToMongoDB, disconnectFromMongoDB } = require('./src/mongodb');
const app = express();
process.loadEnvFile();
const PORT = process.env.PORT || 3000;

//definimos formato de transferencia de datos
app.use(express.json());

//definimos un Middleware global para todos los endpoint de nuestra aplicación.
app.use((req, res, next) => {
  res.header("Content-Type", "application/json", charset='utf-8');

  next();
});

//Ruta Raiz/Principal + mensaje de bienvenida.
app.get('/', (req, res) => {
  res.status(200).end('Bienvenido a la API de frutas!!');
});



//RUTA a Frutas
app.get('/frutas', async(req, res) => {
  try {
    //conexion a Base de Datos:
    const client = await connectToMongoDB();
    if(!client) {
      res.status(500).send('Error al conectarse a Mongo DB');
      return
    }
    //en caso contrario, si hay cliente:
    const db = await client.db('frutas');
    //si logramos acceder a la base de datos pedimos acceso a la coleccion
    const frutas = await db.collection('frutas').find({}).toArray();
    res.json(frutas)
    //si tenemos algun error lo tenemos q manejar:
  } catch (error) {
    res.status(500).send('error al intentar obtener frutas de la base de datos');
    //IMPORTANTE: CERRAR CONEXION A BASE DE DATOS
  }finally {
    await disconnectFromMongoDB();
  }
});

//RUTA a Frutas/:id
app.get('/frutas/:id', async(req, res) => {
  try {
    //conexion a Base de Datos:
    const client = await connectToMongoDB();
    if(!client) {
      res.status(500).send('Error al conectarse a Mongo DB');
      return
    }
    //almacenamos parametro: id
    const frutaId = parseInt(req.params.id) || 0;
    //en caso contrario, si hay cliente:
    const db = await client.db('frutas');
    //si logramos acceder a la base de datos pedimos acceso a la coleccion
    const fruta = await db.collection('frutas').findOne({ id: frutaId });
    res.json(fruta)
    //si tenemos algun error lo tenemos q manejar:
  } catch (error) {
    res.status(500).send('error al intentar obtener frutas de la base de datos');
    //IMPORTANTE: CERRAR CONEXION A BASE DE DATOS
  }finally {
    await disconnectFromMongoDB();
  }
});


app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`); 
  connectToMongoDB();
});

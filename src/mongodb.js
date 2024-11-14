
//Destructuramos, y traemos las funcionalidades q necesitamos (mMngoClient).
const { MongoClient } = require('mongodb');
//cargamos variables de entorno
process.loadEnvFile();

const URI = process.env.MONGODB_URLSTRING;
const client = new MongoClient(URI);


//Funcion para Conexion de MongoDB con Node.js
const connectToMongoDB = async () => {
  try {
    await client.connect();
    console.log("Conectado a MongoDB");
    return client;
  } catch (error) {
    console.error("Error al intentar conectar a MongoDB", error);
    return null;
  }
}

//Funcion para desconectar de MongoDB
const disconnectFromMongoDB = async () => {
  try {
    await client.close();
    console.log("Desconectado de MongoDB");
    
  } catch (error) {
    console.error("Error al desconectar de MongoDB", error);
    return null;
  }
}

module.exports = {
  connectToMongoDB,
  disconnectFromMongoDB
}
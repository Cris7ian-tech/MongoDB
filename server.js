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

//RUTA a Frutas/:id Revisar con la clase
app.get('/frutas/id/:id', async(req, res) => {
  try {
    const idFruta = parseInt(req.params.id) || 0;    
    //conexion a base de datos:
    const client = await connectToMongoDB();
    if(!client) {
      res.status(500).send('Error al conectarse a Mongo DB');
      return
    }
    
    const db = client.db('frutas');
    const fruta = await db.collection('frutas').findOne({ id: idFruta });
    !fruta ? res.status(401).json({"mensaje": "Error en la solicitud"}) : res.status(200).json(fruta);
  
  } catch (error) {
    res.status(500).send('error al intentar obtener frutas de la base de datos');
  }finally {
    await disconnectFromMongoDB();
  }
});
    

//Ruta a Frutas/:nombre REVISAR
app.get('/frutas/nombre/:nombre', async(req, res) => {
  try {
    //capturamos parametro necesario
    const nombreFruta = req.params.nombre;
    //console.log(frutaNombre);
    const client = await connectToMongoDB();
    if(!client) {
      res.status(500).send("Error al conectarse a Mongo DB");
      return
    }

    const db = client.db('frutas');
    //aplicamos metodos para acceder al dato que necesitamos
    const fruta = await db.collection('frutas').find( { nombre: RegExp (nombreFruta, "i") } ).toArray();
    //comprobamos si el array fruta esta vacia o tiene algo
    fruta.length > 0 ? res.status(200).json(fruta) : res.status(404).json('error: Error en la solicitud');

  }catch (error) {
    res.status(500).send('Error al obtener la fruta de la base de datos');
    //desconectamos
  }finally {
    await disconnectFromMongoDB();
  }
});

//RUTA a Frutas por precio:
app.get('/frutas/importe/:precio', async(req, res) => {
  try {
    //capturamos parametro necesario y lo covertimos a numero
    const precioFruta = parseInt (req.params.precio);
    //console.log(precioFruta);
    //conexion a base de datos
    const client = await connectToMongoDB();
    if(!client) {
      res.status(500).send("Error al conectarse a Mongo DB");
      return
    }

    const db = client.db('frutas');
    //aplicamos metodos para acceder al dato que necesitamos
    const fruta = await db.collection('frutas').find( { importe: { $gte: precioFruta } } ).toArray();
    //comprobamos si el array fruta esta vacia o tiene algo
    fruta.length > 0 ? res.status(200).json(fruta) : res.status(404).json('error: Error en la solicitud');

  }catch (error) {
    res.status(500).send('Error al obtener la fruta de la base de datos');
    //desconectamos
  }finally {
    await disconnectFromMongoDB();
  }
});


//------------------------------------------------------------------------------------------------------------------
//CRUD:
//    Como desarrollar un CRUD con mongo db y express (Crear un nuevo recurso))
app.post("/frutas", async(req, res)=>{
  try {
    const nuevaFruta = req.body;
    //console.log(nuevaFruta);
    if(nuevaFruta === undefined) {
      res.status(400).send('Error en el formato de datos a crear')
    }
    //modulo de conexion
    const client = await connectToMongoDB();
    if(!client) {
      res.status(500).send("Error al conectarse a Mongo DB");
      return
    }
    //para crear nuevo recurso, nos conectamos a base de datos
    const db = client.db('frutas');
    const collection = db.collection('frutas');
    await collection.insertOne(nuevaFruta);
    console.log("Nuevo recurso creado!");
    res.status(201).send(nuevaFruta);

  } catch (error) {
    res.status(500).send('Error al intentar crear un nuevo recurso');
  } finally {
    await disconnectFromMongoDB();
  }
})

//Modificar un recurso: metodo .put
app.put("/frutas/id/:id", async(req, res)=>{
  try {
    const idFruta = parseInt(req.params.id);
    const nuevosDatos = req.body;     

    if(!nuevosDatos) {
      res.status(400).send('Error en el formato de datos a crear')
    }

    const client = await connectToMongoDB();
    if(!client) {
      res.status(500).send("Error al conectarse a Mongo DB");
      return
    }

    const db = client.db('frutas');
    const collection = db.collection('frutas');
    await collection.updateOne( {id: idFruta}, {$set: nuevosDatos} );
    //console.log(`La Fruta ${idFruta} ha sido modificada!`);
    res.status(200).send(nuevosDatos);


  } catch (error) {

    res.status(500).json( {"mensaje": error.message});

  }finally{
    await disconnectFromMongoDB();
  }

})



//Eliminar un recurso: metodo .delete
app.delete("/frutas/id/:id", async(req, res)=>{
  try {
    const idFruta = parseInt(req.params.id);
    const nuevosDatos = req.body;

    if(!idFruta) {
      res.status(400).send('Error en el formato de datos a Eliminar')
    }

    const client = await connectToMongoDB();
    if(!client) {
      res.status(500).send("Error al conectarse a Mongo DB");
      return
    }

    const db = client.db('frutas');
    const collection = db.collection('frutas');
    const resultado =await collection.deleteOne( {id: idFruta} );
    
    resultado.deletedCount === 0 ? res.status(404).send(`No se encontro ninguna fruta con el id seleccionado!`) : res.status(204).json({"mensaje": "El recurso se elimino correctamente"});

  } catch (error) {

    res.status(500).json( {"mensaje": error.message});

  }finally{
    await disconnectFromMongoDB();
  }

})

//------------------------------------------------------------------------------------------------------------------
/*
ESPACIO DE TRABAJO: TESTEAR (  )
*/ 




app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`); 
  connectToMongoDB();
});
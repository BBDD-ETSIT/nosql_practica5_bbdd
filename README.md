
<img  align="left" width="150" style="float: left;" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/CEI/LOGOTIPO%20leyenda%20color%20JPG%20p.png">
<img  align="right" width="60" style="float: right;" src="http://www.dit.upm.es/figures/logos/ditupm-big.gif">

<br/><br/><br/>

# Practica ReplicaSet + Sharding

## 1. Objetivo

- Familiarizarse con el funcionamiento de un sistema de bases de datos replicado y particionados, en concreto con ReplicaSet y Sharding de MongoDB
- Integrar en un servicio Web una base de datos en alta disponibilidad mediante dichas réplicas y mejorar la eficiencia a través del particionamiento

## 2. Dependencias

Para realizar la práctica el alumno deberá tener instalado en su ordenador:
- Herramienta GIT para gestión de repositorios [Github](https://git-scm.com/downloads)
- Entorno de ejecución de javascript [NodeJS](https://nodejs.org/es/download/) version 16 o 18
- Base de datos NoSQL [MongoDB](https://www.mongodb.com/download-center/community). Debe de poder ejecutar mongod y mongos

## 3. Descripción de la práctica

En esta práctica el alumno aprenderá por un lado a configurar y a operar con un ReplicaSet de MongoDB para ofrecer a un servicio Web alta disponibilidad en términos de persistencia. Y por otro lado aprenderá como configurar un particionamiento para mejorar la eficiencia de almacenamiento y de busqueda de información. El objetivo final de la práctica es ser capaz de desplegar de manera sencilla el siguiente escenario usando múltiples instancias de mongoDB que se ejecutarán en el mismo ordenador en diferentes puertos (esto en un caso real serían diferentes máquinas o nodos en diferentes partes del mundo). A continuación se explica la función de cada módulo de la figura.

Un detalle a comentar es que la figura indica los diferentes procesos que vamos a desplegar (que serían nodos en un despliegue por el mundo) y en cada uno indica su ip y puerto. La ip en todos los casos es localhost (nuestra máquina local, localhost es equivalente a 127.0.0.1) y el puerto va cambiando, durante las primeras prácticas usabamos el puerto por defecto que es 27017 porque no lo indicábamos en el comando con --port pero ahora lo iremos cambiando para cada instancia que lancemos, asi un nodo escuchará en en puerto 27001 y otro en 27003 etc.


![Architecture](https://github.com/BBDD-ETSIT/nosql_practica5_bbdd/blob/main/img/arquitectura.png?raw=true)

- App Gestión de Pacientes: se trata del servidor Web que se desarrolla en la práctica relativa a ODMs correspondiente de la asignatura. El servidor incluido en este repositorio escucha peticiones en la URL http://localhost:8001 y se conectará a través de un router de Mongodb, mongos (que tendremos escuchando en localhost:27006), con dos clúster que contienen información particionada y replicada de los pacientes. Para saber a que clúser se debe dirigir el router, contaremos con el localizador de MongoDB llamado Config Server.

- config_server: se trata de un clúster replicaSet conformado por una única instancia de mongo desplegada en localhost:27001.

- shard_servers_1: se trata de un clúster replicaSet que contendrá parte de la información de los pacientes. Estará conformado por dos instancias de mongo: una primaria en localhost:27002 y otra secundaria en localhost:27003.

- shard_servers_2: se trata de un clúster replicaSet que contendrá la otra parte de la información de los pacientes. Estará conformado por dos instancias de mongo: una primaria en localhost:27003 y otra secundaria en localhost:27004.

## 4. Descargar e instalar el código del proyecto

Abra un terminal en su ordenador y siga los siguientes pasos.

El proyecto debe clonarse en el ordenador desde el que se está trabajando con:

```
git clone https://github.com/BBDD-ETSIT/nosql_practica5_bbdd
```

A continuación entramos en el directorio de trabajo

```
cd nosql_practica5_bbdd
```

e instalamos las dependencias ejecutando:

```
$ npm install
```

Creamos 5 carpetas para que allí se almacenen los datos de cada una de las instancias de mongo que se desplegarán. Las carpetas NO deben crearse dentro de la carpeta "nosql_practica5_bbdd" así que para ello nos saldremos de dicha carpeta y ejecutamos el comando mkdir de la siguiente manera:

```
$ cd ..
$ mkdir data_patients
$ mkdir data_patients/config data_patients/shard1_1 data_patients/shard1_2 data_patients/shard1_3 data_patients/shard2_1 data_patients/shard2_2
```


## 5. Consejos para antes de empezar

***PLAN DE CONTINGENCIA FRENTE A ERRORES:*** Se recomienda ***APUNTAR*** en un editor de textos todos los ***comandos*** que se ejecuten tanto en la terminal como en la shell de mongo. Para que en caso de que se realice una configuración de replicaset o sharding incorrecta, pueda facilmente parar todos los servidores y ejecutar de nuevo todos los comandos apuntados que se han realizado correctamente. Si se da el caso, se recomienda también ***BORRAR la carpeta data_patients*** y volver a recrear las carpetas como en el punto anterior.

***TERMINATOR:*** En el laboratorio existe un programa llamado terminator. Este programa es como una terminal del ordenador pero con algunas funcionalidades extra. En este caso, se recomienda usar terminator para dividir la pantalla de la terminal en varias mini-ventanas (pinchando con el botón secundario del ratón sobre la ventana de terminator podremos ver la opción de dividir). De esta manera le resultará más fácil gestionar todas las intancias de mongo que se deben ejecutar. Si lo desea, también puede ponerle un nombre a cada una de las mini-ventanas. El resultado de dividir las pantallas debe ser similar al siguiente:

![Terminator](https://github.com/BBDD-ETSIT/nosql_practica5_bbdd/blob/main/img/terminator.png?raw=true)

***TERMINAL Y SHELL DE MONGO:*** Algunos de los comandos que se ejecutan en esta práctica se ejecutan en la terminal mientras que otros se ejecutan en la shell de mongo. Por ejemplo la creación de carpetas, el autocorector o los comandos que empiezan por "npm" se ejecutan en la terminal. Mientras que otros comandos como rs.initiate... o db.patients... se deben ejecutar en la shell de mongo (cuando haya accedido a la shell, podrá observar en el terminal que antes del puntero de escribir aparecerá símbolo ">"). Otra consideración importante es saber la diferencia entre mongo (o mongosh en las últimas versiones de mongo), mongod y mongos. 
- Con "mongod" podemos arrancar un servidor de MongoDb, es decir, es la base de datos en si desplegada. 
- Con "mongo" podemos acceder a la shell de servidores de Mongodb creados con el anterior comando para realizar acciones sobre la BD. (es el equivalente a mongosh en la versión 5 y 6 de mongodb).
- Con "mongos" podemos arrancar un servidor de MongoDb en modo "router". Es decir no almacena información pero es capaz de redirigir peticiones a otros servidores de mongo que si que la tienen. Cuando haya accedido a la shell de un servidor arrancado de esta manera, podrá observar en el terminal que antes del puntero de escribir aparecerá símbolo "mongos>". Es dentro de esta shell donde se ejecutarán TODOS los comandos relativos a SHARDING.

***CAPTURAS:*** Dentro del directorio de la praćtica cree la carpeta "miscapturas" donde guardará las dos capturas exigidas para entregar la práctica.

## 6. Tareas a realizar

Antes comentar que en una situación real, cada instancia de mongo que ejecutaremos debe estar en un servidor separado, pero para nuestras pruebas vamos a hacer que las diferentes instancias de mongo se arranquen en la misma máquina pero en distintos puertos. 

La práctica se realizará por completo en el laboratorio del DIT, pero si alguien quiere probarla en su ordenador personal avisar que los comando que a continuación se exponen se ejecutan en Ubuntu. Si teneis otro Sistema Operativo, como Windows, para ejecutar mongod o mongos debeis abrir una PowerShell e ir al directorio donde teneis almacenado mongod.exe y mongos.exe. Además, deben indicar la ruta absoluta de donde se encuentra la carpeta data_patients, por ejemplo si el repositorio ha sido clonado en el escritorio la instrucción a ejecutar sería similar a esta: PS C:\Archivos de programa\MongoDB\Server\4.2\bin>.\mongod --port 27001 —dbpath C:\Users\usuarioX\Desktop\algunotrodirectorio\data_patients\shard1_1.... Se deben usar los mismos puertos que los mostrados en la figura. Si esta realizando la práctica desplegando instancias de Docker con Mongo asegurese de que ha realizado bien el mapeo de puertos entre el contenedor y el host. Por otro lado, se debe arrancar Mongo sin ningún tipo de autenticación ya que el autocorector se conecta a los servidores para realizar los tests sin usar ningún tipo de usuario/contraseña.


1. En primer lugar arrancaremos y configuraremos el config server que contendrá la información acerca de a que partición dirigirse para obtener determinados datos de un paciente. Para ello, necesitamos:
    - Un directorio de datos por cada servidor de la réplica (creado en la anterior sección). Usar el flag dbpath de mongod para apuntar a dicho directorio.
    - Un puerto para el servidor (indicado en la figura anteriormente mostrada). Usar el flag port de mongod para apuntar a dicho directorio.
    - Indicar que se arranquen en modo configsvr y además en modo replicaSet, indicando el id de dicho replica set (config_servers).

    En una de las mini-ventanas de terminator, ejecutamos la orden con mongod incluyendo lo anterior mencionado:

    ```
    mongod --configsvr --replSet config_servers --port 27001 --dbpath data_patients/config
    ```

    Una vez arrancado, desde otro terminal, nos conectamos al servidor que va a actuar como primario. En las últimas versiones de Mongodb para conectarnos a la shell usabamos el comando "mongosh". Pero dado que en el laboratorio existe la versión 3 de MongoDB ,el comando es "mongosh":
    ```
    mongosh --host localhost:27001
    ```
    Inicialice el replicaSet del config server como hemos visto en las trasparencias de clase, teniendo en cuenta que solo hay una instancia de mongo dentro del clúster y que debemos especificar que se trata de un config server.

2. A continuación, arrancaremos los clúster para almacenar la información particionada. Para ello, necesitamos:
    - Cuatro directorios de datos para cada una de las instancias de mongo (creados en la anterior sección). Usar el flag dbpath de mongod para apuntar a dicho directorio.
    - Un puerto para cada servidor (indicado en la figura anteriormente mostrada). Usar el flag port de mongod para apuntar a dicho directorio.
    - Indicar que se arranquen en modo replicaSet, indicando el id correspondiente para cada replica set (shard_servers_1 y shard_servers_2)
    - Indicar que se arranquen en modo sharding 

    En otras 4 mini-ventanas de terminator, ejecutamos cada una de las siguientes órdernes:
    ```
    mongod  --shardsvr --replSet shard_servers_1 --port 27002 --dbpath data_patients/shard1_1 --oplogSize 50
    ```
    ```
    mongod  --shardsvr --replSet shard_servers_1 --port 27003 --dbpath data_patients/shard1_2 --oplogSize 50
    ```
    ```
    mongod  --shardsvr --replSet shard_servers_2 --port 27004 --dbpath data_patients/shard2_1 --oplogSize 50
    ```
    ```
    mongod  --shardsvr --replSet shard_servers_2 --port 27005 --dbpath data_patients/shard2_2 --oplogSize 50
    ```

    Una vez arrancados debe inicializar los replicaSet para cada uno de los shards. Para ello, desde otro terminal nos conectaremos (como en el paso anterior) en primer lugar a la shell de mongo de localhost:27002 y después a localhost:27004 para configurar en cada uno el replicaSet correspondiente. El primero de ellos estará compuesto de localhost:27002 y localhost:27003 donde localhost:27002 debe tener una prioridad de 900 y localhost:27003 con prioridad de 700. El segundo de ellos estará compuesto de localhost:27004 y localhost:27005 donde localhost:27004 debe tener una prioridad de 600 y localhost:27005 con prioridad de 300.


3. Una vez configurado los clúster de particionamiento, arrancaremos el router Mongos. Para ello, necesitamos:
    - Indicar puerto donde se arranca el router (indicado en la figura anteriormente mostrada). Usar el flag port de mongod para apuntar a dicho directorio.
    - Indicar el replicaSet correspondiente a los config servers.

    En otra de las mini-ventanas de terminator, ejecutar la orden con mongos incluyendo lo anterior mencionado:

    ```
    mongos --configdb config_servers/localhost:27001 --port 27006
    ```

    ***Se recomienda ejecutar el autocorector hasta este punto para comprobar que todos los despliegues realizados se han hecho correctamente.***

4. En este paso, nos conectaremos al router Mongos y añadiremos cada uno de los shards como se ha visto en las trasparencias de clase. Una vez realizado, crearemos un base de datos llamada "bio_bbdd" y una colección dentro de ella llamada "patients". habilitaremos el sharding en esa base de datos y defineremos una clave de particionamiento hashed para el atributo "dni" (el cual se creará a posteriori). IMPORTANTE: se debe hacer este paso obligatoriamente antes que el siguiente, ya que de otra manera el particionamiento no se hará efectivo.

    Conexión a la shell del router Mongos:

    ```
    mongosh --host localhost:27006
    ```    

    Añadir los shards:

    ```
    sh.addShard("shard_servers_1/localhost:27002,localhost:27003")
    sh.addShard("shard_servers_2/localhost:27004,localhost:27005")
    ```

    Y comprobar que los shards se han añadido correctamente ejcutando:

    ```
    sh.status()
    ```

    Crear la base de datos "bio_bbdd", la colección "patients" y habilitamos sharding en esa BD:

    ```
    use bio_bbdd
    db.createCollection("patients")
    sh.enableSharding("bio_bbdd")
    ```

    A continuación, debemos establecer "dni" como la clave de partición. Será una partición de tipo hash. Para ello, rellene el siguiente comando y ejecutelo en la shell:

    ```
    sh.shardCollection("<NOMBRE_BD>.<NOMBRE_COLECCION>", {"<CLAVE_PARTICIÓN>": "hashed"})
    ```

    ***Se recomienda ejecutar el autocorector hasta este punto para comprobar que todos los despliegues realizados se han hecho correctamente.***

5. En este momento, debería de tener bien configurado las particiones. Puede ejecutar algunos comandos vistos en clase para ver el estado. A continuación, en el terminal y dentro del directorio donde hemos clonado el código de la práctica, ejecutamos los seeders para que añadir una serie de pacientes por defecto a nuestro replicaSet:

    ```
    npm run seed
    ```
    
    
6. Compruebe que los pacientes se han guardado en cada una de los Mongo desplegados, de forma particionada, accediendo a la shell de cada uno de ellos y ejecute las operaciones que considere. Recuerde que, para poder rejecutar operaciones de lectura dentro de la shell de mongo de los nodos secundarios, debe ejecutar rs.slaveOk() previamente (o si esta usando Mongo en su versión 5 debe ejecutar rs.secondaryOk()). Compruebe también desde el router Mongos ejecutando desde la base de dadtos bio_bbdd la orden db.patients.getShardDistribution(). Deberá ver que los pacientes se han distribuido de forma correcta en cada un o de los clúser de sharding. 

7. Una vez comprendido el funcionamiento del escenario compruebe que la conexión del escenario con la aplicación. Para ello, acceda al fichero controller/patient.js y observe que se esta realizando una conexión con Moongose al router mongos. A continuación, y desde el directorio de la práctica, arranque la aplicación web de gestión de pacientes con:

    ```
    npm start
    ```

8. Abrá un navegador y navegar a "http://localhost:8001". Inserte, por medio de la aplicación web de gestión de pacientes, un nuevo paciente cuyo DNI sea el token del moodle del alumno. Realice una captura de la interfaz con la lista de pacientes en la que salga el nuevo paciente creado. Esta es una de las caputuras exigidas y que debe guardar dentro del directorio "miscapturas".

9. Verificar que los datos se han escrito solamente en uno de los shards. En este punto, ejecute el comando db.patients.getShardDistribution() dentro de mongos y haga una busqueda a través de la shell de mongos del paciente que acaba de crear (db.patients.findOne....). Haga una captura en la que se observe la salida de los dos comandos y guardela en miscapturas. 


10. Sin detener la ejecución de las instancias de mongo. Añadir un una nueva instancia de mongo (localhost:27007) al primer shard (shard_servers_1). Esta Instancia debe estar configurado como arbiterOnly. Recuerde que en pasos anteriores ya habiamos creado la carpeta necesaria para esta nueva instancia (data_patients/shard1_3). Arranque la una nueva instancia con mongod en otra de las ventanas de terminator:

    ```
    mongod  --shardsvr --replSet shard_servers_1 --port 27007 --dbpath data_patients/shard1_3 --oplogSize 50
    ```

    Nos conectamos previamente al router mongos para poder habilitar la edición de cambios en los clúster de sharding. Si no hacemos los siguientes dos pasos, mongo no nos permitirá añadir un árbitro al primer replicaSet creado.

    ```
    mongosh --host localhost:27006
    ```
    Y dentro del router mongos ejecutamos:
    
    ```
    db.adminCommand(
        {
            setDefaultRWConcern : 1,
            defaultWriteConcern: { w: 1 },
        }
    )
    ```
    
    Ahora nos conectamos al servidor primario del primer replica set creado:

    ```
    mongosh --host localhost:27002
    ```

    Y consultando las transparencias de clase, incluya un arbitro en este replicaSet.

## 7. Ejemplos de capturas

Captura 1:

![Captura 1](https://github.com/BBDD-ETSIT/nosql_practica5_bbdd/blob/main/img/captura1.png?raw=true)

Captura 2:

![Captura 2](https://github.com/BBDD-ETSIT/nosql_practica5_bbdd/blob/main/img/captura2.png?raw=true)


## 8. Prueba de la práctica 

Para ayudar al desarrollo, se provee una herramienta de autocorrección que prueba las distintas funcionalidades que se piden en el enunciado.

La herramienta de autocorrección preguntará por el correo del alumno y el token de Moodle. En el enlace [https://www.npmjs.com/package/autocorector](https://www.npmjs.com/package/autocorector) se proveen instrucciones para encontrar dicho token.

```
$ npx autocorector
```

Se puede pasar la herramienta autocorector tantas veces como se desee sin ninguna repercusión en la calificación.

## 9. Instrucciones para la Entrega y Evaluación.

Una vez satisfecho con su calificación, el alumno puede subir su entrega a Moodle con el siguiente comando:
```
$ npx autocorector --upload
```

El alumno podrá subir al Moodle la entrega tantas veces como desee pero se quedará registrada solo la última subida.

**RÚBRICA**: Ejecute el autocorector para ver la distribución de puntos o eche un ojo a los tests de la carpeta autocorector

Si pasa todos los tests se dará la máxima puntuación. 

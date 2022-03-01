
<img  align="left" width="150" style="float: left;" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/CEI/LOGOTIPO%20leyenda%20color%20JPG%20p.png">
<img  align="right" width="60" style="float: right;" src="http://www.dit.upm.es/figures/logos/ditupm-big.gif">

<br/><br/><br/>

# P5_REP_BBDDNR

## Objetivos

- Familiarizarse con el funcionamiento de un sistema de bases de datos replicado, en concreto con el ReplicaSet de MongoDB
- Integrar en un servicio Web una base de datos en alta disponibilidad mediante dichas réplicas

## 2. Dependencias

Para realizar la práctica el alumno deberá tener instalado en su ordenador:
- Herramienta GIT para gestión de repositorios [Github](https://git-scm.com/downloads)
- Entorno de ejecución de javascript [NodeJS](https://nodejs.org/es/download/)
- Base de datos NoSQL [MongoDB](https://www.mongodb.com/download-center/community)

## 3. Descripción de la práctica

En esta práctica el alumno aprenderá a configurar y a operar con un ReplicaSet de MongoDB para ofrecer a un servicio Web alta disponibilidad en términos de persistencia. El objetivo final de la práctica es ser capaz de desplegar de manera sencilla el siguiente escenario usando múltiples instancias de mongoDB que se ejecutarán en el mismo ordenador. A continuación se explica la función de cada módulo de la figura.

![](https://raw.githubusercontent.com/ging/P5_REP_BBDDNR/master/img/diagrama.png)

- App Gestión de Pacientes: se trata del servidor Web desarrollado en la práctica correspondiente de la asignatura. El servidor incluido en este repositorio escucha peticiones en http://localhost:8001 y se conectará contra un replicaSet llamado my-mongo-set y formado por cuatro instancias de mongo corriendo en localhost:27001, localhost:27002,  localhost:27003 y localhost:27004. 

- Primary/Secondary: son los miembros del ReplicaSet de MongoDB. Cada uno de ellos se arrancara en el puerto especificado en el diagrama.

## 4. Descargar e instalar el código del proyecto

Abra un terminal en su ordenador y siga los siguientes pasos.

El proyecto debe clonarse en el ordenador desde el que se está trabajando con:

```
git clone https://github.com/BBDD-ETSIT/nosql_practica5_bbdd
```

y entrar en el directorio de trabajo

```
cd nosql_practica5_bbdd
```

Una vez dentro de la carpeta, se instalan las dependencias con:

```
npm install
```

Crear 4 carpetas en su ordenador. En ellas se almacenen los datos de cada una de las instancias de mongo que se desplegarán. **IMPORTANTE** La carpeta data_patients se debe crear fuera del directorio de la práctica. Si se crean dentro de la carpeta nosql_practica5_bbdd, el autocorrector dará problemas a la hora de subir la nota a Moodle. Por ejemplo, puede crearlas en el escritorio de su ordenador (_C:\Users\usuarioX\Desktop\data_patients_). Para ello, puede abrir otra terminal o powershell distinta, navegue usando el comando "cd" hasta el escritorio y una vez alli, ejecute los siguientes comandos.


```
mkdir data_patients
mkdir data_patients/data1 
mkdir data_patients/data2 
mkdir data_patients/data3 
mkdir data_patients/data4
```


## 5. Tareas a realizar


1. Arrancar todos los servidores en modo replica usando mongod. En una situación real, cada servidor del conjunto réplica debe estar en un servidor separado, pero para nuestras pruebas vamos a hacer que los diferentes servidores se arranquen en la misma máquina. Para ello necesitaremos:
    - Un directorio de datos por cada servidor de la réplica (creados en el anterior punto)
    - Un puerto para cada servidor
    - Indicar que se arranquen en modo replicaSet e indicando el id de dicho replica set.

    En Ubuntu ejecutamos cada una de las siguientes instrucciones en un terminal distinto:

    ```
    mongod --port 27001 --replSet my-mongo-set --dbpath ./data_patients/data1 --oplogSize 50
    mongod --port 27002 --replSet my-mongo-set --dbpath ./data_patients/data2 --oplogSize 50
    mongod --port 27003 --replSet my-mongo-set --dbpath ./data_patients/data3 --oplogSize 50
    mongod --port 27004 --replSet my-mongo-set --dbpath ./data_patients/data4 --oplogSize 50
    ```
    Si teneis otro Sistema Operativo, como Windows, para ejecutar mongod debeis abrir una PowerShell e ir al directorio donde teneis almacenado mongod.exe. Además, deben indicar la ruta absoluta de donde se encuentra la carpeta data_patients, por ejemplo si el repositorio ha sido clonado en el escritorio la instrucción a ejecutar sería similar a esta: PS C:\Archivos de programa\MongoDB\Server\4.2\bin> .\mongod.exe --port 27001 --replSet my-mongo-set --dbpath C:\Users\usuarioX\Desktop\data_patients\data1 --oplogSize 50
    
2. Se creará la réplica, indicando que todos los servidores están en el mismo conjunto, para ello nos conectamos al servidor que va a actuar como primario:

    ```
    mongo --host localhost:27001
    ```
Si teneis Windows el comando se deberá ejecutar como ./mongo.exe como siempre hemos hecho. Al final estamos abriendo una shell contra el mongod que tenemos en el puerto 27001 que será el primario.

3. Configurar el replica set para que las 4 instancias que se levantaron anteriormente sean parte del replicaset my-mongo-set. Busque en las transparencias de clase como inicializar el replica set con varias intancias a la vez. Debe definir con prioridad igual a 900 al servidor principal ("localhost:27001") y a la cuarta instancia de mongodb ("localhost:27004") se debe configurar para que tenga una prioridad de 0 y que el tiempo de retardo de replicación esté limitado a 60 seg.

4. A continuación, en el terminal y dentro del directorio donde hemos clonado el código de la práctica, ejecutamos los seeders para que añadir una serie de pacientes por defecto a nuestro replicaSet:

    ```
    npm run seed
    ```
    
    
5. Compruebe que los pacientes se han guardado en cada una de los Mongos desplegados accediendo a la shell de cada uno de ellos y ejecute las operaciones que considere. Recuerde que, para poder rejecutar operaciones de lectura dentro de la shell de mongo de los nodos secundarios, debe ejecutar rs.slaveOk() previamente.

6. Una vez comprendido el funcionamiento del escenario debe establecerse la conexión a la réplica desde la aplicación. Para ello, el alumnos debe modificar la conexión en el fichero rest_server.js e incluir los valores correspondientes para que la aplicación se conecte a la réplica “my-mongo-set” en vez de a una única instancia de Mongo. Revise las transparencias de clase de ReplicaSet para ver como hacerlo con Mongoose.

7. Ejecutar el servidor de la aplicación web de gestión de pacientes

    ```
    npm start
    ```

8. Insertar un nuevo paciente cuyo DNI sea el token del moodle del alumno por medio de la aplicación web de gestión de pacientes.

9. Verificar que los datos se han escrito tanto en el primario como en los secundarios y que además se respeta el delay en el servidor de mongo "localhost:27004”

10. Sin detener la ejecución de las 4 instancias de mongo. Añadir un una quinta instancia de mongo al replicaset(localhost:27005). Esta Instancia debe estar configurado como arbiterOnly. Nuevamente cree un directorio especifico para esta instancia (Ej: data_patients/data5), arranque una nueva instancia con mongod en otro terminal y consulte las transparencias de clase para ver como incluir un arbitro en el replicaSet. Este árbitro de incluye desde el servidor primario.

## 6. Prueba de la práctica 

Para ayudar al desarrollo, se provee una herramienta de autocorrección que prueba las distintas funcionalidades que se piden en el enunciado.

La herramienta de autocorrección preguntará por el correo del alumno y el token de Moodle. En el enlace [https://www.npmjs.com/package/autocorector](https://www.npmjs.com/package/autocorector) se proveen instrucciones para encontrar dicho token.

Para instalar y hacer uso de la [herramienta de autocorrección](https://www.npmjs.com/package/autocorector) en el ordenador local, ejecuta los siguientes comandos en el directorio del proyecto:

```
autocorector
```

Se puede pasar la herramienta autocorector tantas veces como se desee sin ninguna repercusión en la calificación.

## 7. Instrucciones para la Entrega y Evaluación.

Una vez satisfecho con su calificación, el alumno puede subir su entrega a Moodle con el siguiente comando:
```
autocorector --upload
```

El alumno podrá subir al Moodle la entrega tantas veces como desee pero se quedará registrada solo la última subida.

**RÚBRICA**: Cada método que se pide resolver de la practica se puntuara de la siguiente manera:
-  **1.5 punto por cada uno de las siguientes funciones realizadas:**  Numero de réplicas desplegadas correctamente y replica principal con prioridad 900
-  **2 puntos por cada uno de las siguientes funciones realizadas:**  Conexión de la aplicación al replicaSet y añadir un arbitro a la replica posteriormente 
-  **3 puntos por cada uno de las siguientes funciones realizadas:**  Una replica secundaria con prioridad 0 más delay de 60 segundos (1,5 cada configuración)


Si pasa todos los tests se dará la máxima puntuación. 

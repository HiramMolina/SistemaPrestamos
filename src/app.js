// Este es el encargado de ejecutar el servidor
const express = require('express'); //Requerir express
const morgan = require('morgan');   //Se usan en los middlewares
const app = express();              //Se inicializa a traves de la constante app


const path = require('path'); //Modulo encargado de unir directorios
const mysql = require('mysql'); //Permite la conexión y la interacción con bases de datos MySQL desde una aplicación Node.js
const myConnection = require('express-myconnection'); //simplifica el manejo de conexiones a bases de datos MySQL en aplicaciones Express. Facilita la gestión de conexiones a la base de datos, permitiendo reutilizar las conexiones en diferentes rutas y manejarlas de manera más eficiente.

//Importando routes
const clienteRoutes = require('./routes/cliente');


// Settings: Dejabo va el puerto, que motor de plantilla usará, que carpeta van las vistas, que se enviará al navegador, etc.
app.set('port', process.env.PORT || 3000); //Aqui se pide se encuentre un port en el S.O., SI NO, que use el 3000
// Se configura el motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Middlewares
//Funciones que se ejecutan antes de que vengan las peticiones de los usuarios
app.use(morgan('dev'));
app.use(myConnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'prestamos'
}, 'single'));

//urlencoded es el tipo de datos que se espera recibir
// { extended: false } es una configuración que indica cómo se deben analizar estos datos. C
// uando se establece en false, se utiliza un analizador simple en lugar de uno complejo, permitiendo 
// que Express solo analice datos sencillos y no datos anidados o complejos.
app.use(express.urlencoded({ extended: false }));

//Rutas
//Todas las URLS que se van a pedir en el servidor
// app.use('/', customerRoutes); Descartado
app.use('/', clienteRoutes);
app.get('/registro_prestamo', (req, res) => {
    res.render('registro_prestamo');
});
app.get('/agregar_prestamo', (req, res) => {
    res.render('agregar_prestamo');
});
app.get('/amortizacion', (req, res) => {
    res.render('amortizacion');
});
//Archivos estaticos - Complementos, Imagenes, CSS, frontend en general
app.use(express.static(path.join(__dirname, 'public')))


app.listen(app.get('port'), () => {
    console.log('Server on port 3000');
});


app.get('/', (req, res) => res.send('Hola mundo desde el puerto 3000!'))

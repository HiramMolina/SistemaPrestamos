const controller = {};
const moment = require('moment');

// LISTAR LEER DATOS
controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM cliente', (err, cliente) => {
            if (err) {
                res.json(err);
            } //Si no encuentra un error VVV
            
            const data = cliente;
            res.render('cliente', { data });
        });
    });
};

// GUARDAR DATOS 
controller.guardar = (req, res) => {
    const data = req.body;
    //Metemos todos los datos en body
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO cliente set ?', [data], (err, cliente) => {
            res.redirect('/');
        })
    })
};

// DELETE DATOS
controller.eliminar = (req, res) => {
    const { idCliente } = req.params;

    req.getConnection((err, conn) => {
        conn.query('DELETE FROM cliente WHERE idCliente = ?', [idCliente], (err, rows) => {
            res.redirect('/');
        })
    })
};


// UPDATE DATOS
controller.actualizar = (req, res) => {
    const { idCliente } = req.params;

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM cliente WHERE idCliente = ?', [idCliente], (err, cliente) => {
            
            res.render('cliente_editar', {
                data: cliente[0]

            });
        });
    });
};


// GUARDAR DATOS EDITADOS
controller.guardarEdit = (req, res) => {
    const { idCliente } = req.params;
    const nuevosDatos = req.body;
    
    //Metemos todos los datos en body
    req.getConnection((err, conn) => {
        conn.query('UPDATE cliente SET ? WHERE idCliente = ?', [nuevosDatos, idCliente], (err, cliente) => {
            if (err) {
                console.error('Error al actualizar datos:', err);
                return res.status(500).send('Error al actualizar datos');
            }
            res.redirect('/');
        })
    })
};

//PAGINA REGISTRO DE PRESTAMO

//BUSCAR REGISTRO
// controller.buscar= (req,res) => {
//     const {nombreCliente} = req.params;
//     req.getConnection ((err,conn) => {
//         conn.query('SELECT * FROM cliente WHERE nombreCliente = ?', [nombreCliente], (err, cliente) => {
//             if(err || cliente.length === 0){
//                 console.log('No se encontró el cliente');
//                 // CREAR VENTANA ALERTA NO ENCONTRADO
//             }else{//Si no encuentra un error VVV
//                 console.log(cliente);
//                 const data = cliente[0];
//             } 
//             res.render('/registro_prestamo', {data});
//         });
//     });
// };

controller.buscar = (req, res) => {
    const { nombreCliente } = req.query;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM prestamo WHERE nombreCliente = ?', [nombreCliente], (err, cliente) => {
            if (err || cliente.length === 0) {
                
                res.redirect('/registro_prestamo');
            } else {
                
                const data = cliente[0];
                res.render('registro_prestamo', { data });
            }
        });
    });
};

// **********************SECCION DROPDOWNS********************************

const obtenerClientes = (conn) => {
    return new Promise((resolve, reject) => {
        conn.query('SELECT nombreCliente FROM cliente', (err, opcionesNombre) => {
            if (err) {
                reject(err);
            } else {
                resolve(opcionesNombre);
                
            }
        });
    });
};
const obtenerPlazos = (conn) => {
    return new Promise((resolve, reject) => {
        conn.query('SELECT plazo FROM plazo ', (err, opcionesPlazos) => {
            if (err) {
                reject(err);
            } else {
                resolve(opcionesPlazos);
            }
        });
    });
};
const obtenerMontos = (conn) => {
    return new Promise((resolve, reject) => {
        conn.query('SELECT monto FROM monto', (err, opcionesMontos) => {
            if (err) {
                reject(err);
            } else {
                resolve(opcionesMontos);
            }
        });
    });
};
controller.mandarSelects = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            // Manejo de errores de conexión
            res.json(err);
        } else {
            Promise.all([
                obtenerClientes(conn),
                obtenerPlazos(conn),
                obtenerMontos(conn)
            ])
                .then((resultados) => {
                    const data = {
                        clientes: resultados[0],
                        plazos: resultados[1],
                        montos: resultados[2]
                    };
                  
                    res.render('agregar_prestamo', { data });
                })
        }
    });
};

controller.guardarSelects = (req, res) => {
    const { clientes, monto, plazo } = req.body;
    req.getConnection((err, conn) => {
        if (err) {
            // Manejar el error de conexión
            console.error('Error de conexión:', err);
            return res.status(500).send('Error de conexión');
        }
        const sql = 'INSERT INTO prestamo (nombreCliente, montoPrestamo, plazoPrestamo) VALUES (?, ?, ?)';
        const values = [clientes, monto, plazo];
        conn.query(sql, values, (err, result) => {
            if (err) {
                // Manejar el error de la consulta SQL
                console.error('Error al insertar datos:', err);
                return res.status(500).send('Error al insertar datos');
            }
            console.log('Datos insertados correctamente');
            res.redirect('/registro_prestamo');
        });
    });
};


// ******************************** CATALOGO MONTOS Y PLAZOS **********************************************************************************************


const obtenerCatMontos = (conn) => {
    return new Promise((resolve, reject) => {
        conn.query('SELECT monto FROM monto', (err, opcionesMontos) => {
            if (err) {
                reject(err);
            } else {
                resolve(opcionesMontos);
                
            }
        });
    });
};
const obtenerCatPlazos = (conn) => {
    return new Promise((resolve, reject) => {
        conn.query('SELECT plazo FROM plazo ', (err, opcionesPlazos) => {
            if (err) {
                reject(err);
            } else {
                resolve(opcionesPlazos);
            }
        });
    });
};
controller.mandarCatalogos = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            // Manejo de errores de conexión
            res.json(err);
        } else {
            Promise.all([
                obtenerCatMontos(conn),
                obtenerCatPlazos(conn),
            ])
                .then((resultados) => {
                    const data = {
                        montos: resultados[0],
                        plazos: resultados[1]
                    };
                    res.render('catalogos', { data });
                })
        }
    });
};

controller.genTabla = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM prestamo', (err, cliente) => {
            if (err) {
                res.json(err);
            } //Si no encuentra un error VVV
            
            const data = cliente;
            res.render('amortizacion', { data });
        });
    });
};


// ******************************************** TABLA AMORTIZACION **********************************************

controller.genAmort = (req, res) => {
    const { idprestamo } = req.params; //SE EXTRAE IDPRESTAMO
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM prestamo WHERE idprestamo = ?', [idprestamo], (err, cliente) => {
            console.log(cliente);
            //Formateo de fechas
            const fechaRegistro = cliente[0].fecha_registro;
            const fechaFormateada = moment(fechaRegistro).format('DD-MM-YYYY');
            
            //Calcular interés
            const plazoPrestamo = cliente[0].plazoPrestamo;
            const montoPrestamo = cliente[0].montoPrestamo;
            const interes  = (11/100) * montoPrestamo;
            const pagoPlazo = montoPrestamo / plazoPrestamo;
            const abono = pagoPlazo + interes;

            const interesTotal = interes * plazoPrestamo;
            const pagoTotal = (interesTotal*1) + (montoPrestamo*1);

            const dataenviar = {
                ...cliente[0],
                fecha_registro: fechaFormateada,
                interes: interes,
                abono: abono,
                pagoPlazo: pagoPlazo,
                interesTotal: interesTotal,
                pagoTotal: pagoTotal
            };

            // Obtener fechas de pago cada 15 días
            const fechasPago = [];
            let currentDate = moment(fechaRegistro);
            while (currentDate.isBefore(moment().add(plazoPrestamo, 'days'))) {
                fechasPago.push(currentDate.format('DD-MM-YYYY'));
                currentDate = currentDate.add(15, 'days');
            }

            res.render('amortizacion', {
                data: dataenviar,
                fechasPago: fechasPago // Pasar las fechas de pago a la vista
                
            });
            console.log(fechasPago);
            console.log(currentDate);
        });
    });
};




 



module.exports = controller;

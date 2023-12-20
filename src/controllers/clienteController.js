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


//REMAKE DE CONTROLLER BUSCAR

controller.buscar = (req, res) => {
    const { nombreCliente } = req.query;
    req.getConnection((err, conn) => {
        if (err) {
            // Manejo de errores de conexión
            console.log('Conexion fallida');
        } else {
            // Consulta para obtener datos del cliente
            conn.query('SELECT * FROM cliente WHERE nombreCliente = ?', [nombreCliente], (err, cliente) => {
                if (err || cliente.length === 0) { //Si el nombre viene vacio, falla
                    console.log('Cliente no encontrado');
                } else { //Si el nombre si tiene registro:
                    // console.log('Cliente: ', cliente);
                    // console.log('Cliente encontrado como: ' ,nombreCliente);

                    const clienteData = cliente[0];
                    const idCliente = clienteData.idCliente; // Extraer el idCliente del cliente encontrado
                    // console.log('idCliente: ',idCliente);
                    // Consulta de prestamo utilizando el idCliente extraido
                    conn.query('SELECT * FROM prestamo WHERE idCliente = ?', [idCliente], (err, prestamos) => {
                        // console.log('Datos crudos de la consulta: ',prestamos);
                        if (err) {
                            console.log('Error');
                        } else {
                            const otraTablaData = prestamos[0];
                            // console.log('Otra tabla data',otraTablaData);
                            res.render('registro_prestamo', {
                                clienteData, otraTablaData
                            });
                        }
                    });
                }
            });
        }
    });
};




// **********************REGISTRAR PRESTAMO - SECCION SELECTS********************************

const obtenerClientes = (conn) => {
    return new Promise((resolve, reject) => {
        conn.query('SELECT idCliente, nombreCliente FROM cliente', (err, opcionesNombre) => {
            if (err) {
                reject(err);
            } else {
                resolve(opcionesNombre);
            }
            // console.log('OPCIONES', opcionesNombre);
            idExtraida = opcionesNombre.idCliente;

            // console.log('ID', idExtraida);
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
                    //   console.log('DATA RESOLVIDA',data);
                    res.render('agregar_prestamo', { data });
                })
        }
    });
};

controller.guardarSelects = (req, res) => {
    const { clientes, monto, plazo } = req.body;
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión:', err);
            return res.status(500).send('Error de conexión');
        }

        const sql = 'INSERT INTO prestamo (idCliente, montoPrestamo, plazoPrestamo) VALUES (?, ?, ?)';
        const values = [clientes, monto, plazo];
        
        conn.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error al insertar datos:', err);
                return res.status(500).send('Error al insertar datos');
            }
            
            console.log('Datos insertados correctamente');

            const cuota = monto / plazo; // Calcular la cantidad de cada cuota
            const tasaInteres = 0.05; // Tasa de interés (ejemplo: 5%)
            let numeroPago = 1; // Inicializar el número de pago en 1

            // Insertar registros en la tabla de amortización
            for (let i = 0; i < plazo; i++) {
                const interes = cuota * tasaInteres; // Calcular el interés para cada cuota
                const abonoTotal = cuota + interes; // Calcular el abono total

                const amortizacionSQL = 'INSERT INTO amortizacion (idPrestamo, numeroPago, cuota, interes, abonoTotal) VALUES (?, ?, ?, ?, ?)';
                const amortizacionValues = [result.insertId, numeroPago, cuota, interes, abonoTotal]; // result.insertId obtiene el ID del préstamo insertado

                conn.query(amortizacionSQL, amortizacionValues, (err, result) => {
                    if (err) {
                        console.error('Error al insertar datos en tabla de amortización:', err);
                        return res.status(500).send('Error al insertar datos en tabla de amortización');
                    }
                    console.log('Datos de amortización insertados correctamente');
                });

                numeroPago++; // Incrementar el número de pago para el siguiente registro
            }
            
            res.redirect('/registro_prestamo');
        });
    });
};


// controller.guardarSelects = (req, res) => {
//     const { clientes, monto, plazo } = req.body;
//     req.getConnection((err, conn) => {
//         if (err) {
//             // Manejar el error de conexión
//             console.error('Error de conexión:', err);
//             return res.status(500).send('Error de conexión');
//         }
//         const sql = 'INSERT INTO prestamo (idCliente, montoPrestamo, plazoPrestamo) VALUES (?, ?, ?)';
//         const values = [clientes, monto, plazo];
        
//         conn.query(sql, values, (err, result) => {
//             if (err) {
//                 // Manejar el error de la consulta SQL
//                 console.error('Error al insertar datos:', err);
//                 return res.status(500).send('Error al insertar datos');
//             }
//             console.log('Datos insertados correctamente');
//             res.redirect('/registro_prestamo');
//         });
//     });
// };




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
    const { idCliente } = req.params; //SE EXTRAE IDPRESTAMO
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM prestamo WHERE idCliente = ?', [idCliente], (err, cliente) => {
            console.log('***************DATO CLIENTE:0', cliente);
            //Formateo de fechas
            const fechaRegistro = cliente[0].fecha_registro;
            const fechaFormateada = moment(fechaRegistro).format('DD-MM-YYYY');

            //Calcular interés
            const plazoPrestamo = cliente[0].plazoPrestamo;
            const montoPrestamo = cliente[0].montoPrestamo;
            const interes = (11 / 100) * montoPrestamo;
            const pagoPlazo = montoPrestamo / plazoPrestamo;
            const abono = pagoPlazo + interes;

            const interesTotal = interes * plazoPrestamo;
            const pagoTotal = (interesTotal * 1) + (montoPrestamo * 1);

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
            const newDate = currentDate.format('DD-MM-YYYY');
            console.log('NEW', newDate);
            res.render('amortizacion', {
                data: dataenviar,
                fechasPago: fechasPago // Pasar las fechas de pago a la vista
            });
            console.log('FECHA PAGO', fechasPago);
            console.log('CURRENT', currentDate);
        });
    });
};






// controller.genAmort = (req, res) => {
//     const { idCliente } = req.params; //SE EXTRAE IDPRESTAMO
//     req.getConnection((err, conn) => {
//         conn.query('SELECT * FROM prestamo WHERE idCliente = ?', [idCliente], (err, cliente) => {
//             console.log('***************DATO CLIENTE:0',cliente);
//             //Formateo de fechas
//             const fechaRegistro = cliente[0].fecha_registro;
//             const fechaFormateada = moment(fechaRegistro).format('DD-MM-YYYY');

//             //Calcular interés
//             const plazoPrestamo = cliente[0].plazoPrestamo;
//             const montoPrestamo = cliente[0].montoPrestamo;
//             const interes = (11 / 100) * montoPrestamo;
//             const pagoPlazo = montoPrestamo / plazoPrestamo;
//             const abono = pagoPlazo + interes;

//             const interesTotal = interes * plazoPrestamo;
//             const pagoTotal = (interesTotal * 1) + (montoPrestamo * 1);

//             const dataenviar = {
//                 ...cliente[0],
//                 fecha_registro: fechaFormateada,
//                 interes: interes,
//                 abono: abono,
//                 pagoPlazo: pagoPlazo,
//                 interesTotal: interesTotal,
//                 pagoTotal: pagoTotal

//             };

//             // Obtener fechas de pago cada 15 días
//             const fechasPago = [];
//             let currentDate = moment(fechaRegistro);
//             while (currentDate.isBefore(moment().add(plazoPrestamo, 'days'))) {
//                 fechasPago.push(currentDate.format('DD-MM-YYYY'));
//                 currentDate = currentDate.add(15, 'days');
//             }
//             const newDate = currentDate.format('DD-MM-YYYY');
//             console.log('NEW', newDate);
//             res.render('amortizacion', {
//                 data: dataenviar,
//                 fechasPago: fechasPago // Pasar las fechas de pago a la vista

//             });
//             console.log('FECHA PAGO', fechasPago);
//             console.log('CURRENT', currentDate);
//         });
//     });
// };


module.exports = controller;

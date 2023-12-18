const controller = {};

// LISTAR LEER DATOS
controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM cliente', (err, cliente) => {
            if (err) {
                res.json(err);
            } //Si no encuentra un error VVV
            console.log(cliente);
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
            console.log('Funcion actualizar');
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
    console.log('Datos recibidos para actualizar:', nuevosDatos); // Verifica los datos recibidos del formulario
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
                console.log('No se encontró el cliente o hubo un error en la consulta.');
                res.redirect('/registro_prestamo');
            } else {
                console.log('Datos del cliente encontrado:', cliente);
                const data = cliente[0];
                res.render('registro_prestamo', { data });
            }
        });
    });
};

// **********************SECCION DROPDOWNS********************************

// controller.aggPrestamo= (req,res) => {
//     req.getConnection ((err,conn) => {
//         conn.query('SELECT nombreCliente FROM cliente', (err, opcionesNombre) => {
//             if(err){
//                 res.json(err);
//             } //Si no encuentra un error VVV
//             console.log(opcionesNombre);
//             const data = opcionesNombre;
//             res.render('agregar_prestamo', {data});
//         });
//     });
// };

// controller.aggPlazo= (req,res) => {
//     req.getConnection ((err,conn) => {
//         conn.query('SELECT plazo FROM plazo', (err, opcionesPlazo) => {
//             if(err){
//                 res.json(err);
//             } //Si no encuentra un error VVV
//             console.log(opcionesPlazo);
//             const data = opcionesPlazo;
//             res.render('agregar_prestamo', {data});
//         });
//     });
// };



// const obtenerClientes = () => {
//     req.getConnection ((err,conn) => {
//         conn.query('SELECT nombreCliente FROM cliente', (err, opcionesNombre) => {
//             if(err){
//                 res.json(err);
//             } //Si no encuentra un error VVV
//             console.log(opcionesNombre);
//             const data = opcionesNombre;
//             // res.render('agregar_prestamo', {data});
//     return opcionesClientes; // Supongamos que opcionesClientes contiene un array de objetos con valores y textos para los clientes
//         });
//     });
// };

// const obtenerPlazos = () => {
//     req.getConnection ((err,conn) => {
//         conn.query('SELECT plazo FROM plazo', (err, opcionesPlazo) => {
//             if(err){
//                 res.json(err);
//             } //Si no encuentra un error VVV
//             console.log(opcionesPlazo);
//             const data = opcionesPlazo;
//     return opcionesPlazos; // Supongamos que opcionesPlazos contiene un array de objetos con valores y textos para los plazos
//         });
//     });
// };

// const obtenerMontos = () => {
//     req.getConnection ((err,conn) => {
//         conn.query('SELECT Monto FROM monto', (err, opcionesMonto) => {
//             if(err){
//                 res.json(err);
//             } //Si no encuentra un error VVV
//             console.log(opcionesMonto);
//             const data = opcionesMonto;
//             // res.render('agregar_prestamo', {data});
//     return opcionesMontos;
//         });
//     });
// };

// controller.renderizarSelects = (req, res) => {
//     req.getConnection((err, conn) => {
//         const data = {
//             clientes: obtenerClientes(),
//             plazos: obtenerPlazos(),
//             montos: obtenerMontos()
//         };
//         res.render('agregar_prestamo', { data });
//         }
//     )}

const obtenerClientes = (conn) => {
    return new Promise((resolve, reject) => {
        conn.query('SELECT nombreCliente FROM cliente', (err, opcionesNombre) => {
            if (err) {
                reject(err);
            } else {
                resolve(opcionesNombre);
                console.log(opcionesNombre);
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
                    console.log(data);
                    res.render('agregar_prestamo', { data });
                })
        }
    });
};

// controller.guardarSelects = (req, res) => {
//     const {clientes, monto, plazo} = req.body;
//     console.log('Nombre:',clientes);
//     console.log('Monto:',monto);
//     console.log('Plazo:',plazo);
//     //Metemos todos los datos en body
//     req.getConnection((err, conn) => {
//         conn.query('INSERT INTO (nombreCliente, montoPrestamo, plazoPrestamo ) VALUES (?,?,?)', [clientes, monto, plazo], (err, datos) => {
//             const = values = [clientes,monto,plazo];
//             console.log('SE VA A MANDAR: ', clientes, plazo, monto);
//             console.log('LOS DATOS SON: ', datos);
//             res.redirect('/registro_prestamo');
//         })
//     })
// };

controller.guardarSelects = (req, res) => {
    const { clientes, monto, plazo } = req.body;
    console.log('Nombre:', clientes);
    console.log('Monto:', monto);
    console.log('Plazo:', plazo);

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

// controller.listar = (req, res) => {
//     req.getConnection((err, conn) => {
//         conn.query('SELECT monto FROM monto', (err, cliente) => {
//             if (err) {
//                 res.json(err);
//             } //Si no encuentra un error VVV
//             console.log(cliente);
//             const data = cliente;
//             res.render('catalogos', { data });
//         });
//     });
// };

// controller.listarplazo = (req, res) => {
//     setTimeout(function() {
//         req.getConnection((err, conn) => {
//             conn.query('SELECT plazo FROM plazo', (err, cliente) => {
//                 if (err) {
//                     res.json(err);
//                 } //Si no encuentra un error VVV
//                 console.log(cliente);
//                 const data = cliente;
//                 res.render('catalogos', { data });
//             });
//         });
//       }, 500); 
// };

const obtenerCatMontos = (conn) => {
    return new Promise((resolve, reject) => {
        conn.query('SELECT monto FROM monto', (err, opcionesMontos) => {
            if (err) {
                reject(err);
            } else {
                resolve(opcionesMontos);
                console.log(opcionesMontos);
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
                    console.log(data);
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
            console.log(cliente);
            const data = cliente;
            res.render('amortizacion', { data });
        });
    });
};


// ******************************************** TABLA AMORTIZACION **********************************************

controller.obtenerNombre = (req, res) => {
    const { nombreCliente } = req.query;
    req.getConnection((err, conn) => {
        conn.query('SELECT nombreCliente FROM prestamo WHERE nombreCliente = ?', [nombreCliente], (err, cliente) => {
            if (err || cliente.length === 0) {
                console.log('No se encontró el cliente o hubo un error en la consulta.');
                res.redirect('/registro_prestamo');
            } else {
                console.log('Datos del cliente encontrado:', cliente);
                const nombre = cliente[0];
                res.render('amortizacion', { nombre });
            }
        });
    });
};


module.exports = controller;

const express = require('express');
const { raw } = require('mysql');
const router = express.Router(); //En este metodo se puedenir agregando rutas que pueden reutilizarse

const clienteController = require('../controllers/clienteController');

// LISTAR - VER TABLA
router.get('/', clienteController.list);
// DELETE
router.get('/eliminar/:idCliente', clienteController.eliminar);
// UPDATE
router.get('/actualizar/:idCliente', clienteController.actualizar);
// ACTUALIZAR DATOS
router.post('/actualizar/:idCliente', clienteController.guardarEdit);
// GUARDAR NUEVO REGISTRO
router.post('/add', clienteController.guardar);

// ************************** REGISTRO PRESTAMO ********************************

//BUSCAR CLIENTE 
router.get('/buscarRegistro', clienteController.buscar);

// router.get('/agregar_prestamo',clienteController.aggPrestamo);

// router.get('/agregar_prestamo/plazo',clienteController.aggPlazo);

router.get('/agregar_prestamo', clienteController.mandarSelects);

router.post('/guardar_prestamo', clienteController.guardarSelects);

// **************************** CATALOGO DE MONTOS Y PLAZOS *****************************

// router.get('/catalogos', clienteController.listar);

router.get('/catalogos', clienteController.mandarCatalogos);

// ******************************** TABLA DE AMORTIZACION ***********************************

router.get('/amortizacion', clienteController.genTabla);

// router.get('/obtenerNombre', clienteController.obtenerNombre);
// VER AMORTIZACION
router.get('/genAmort/:idprestamo', clienteController.genAmort);



module.exports = router;


// No vamos a usar put ni delete para no usar AJAX
// --- START --- : Funciones auxiliares

const aTamanio = (string, tam) => {
    switch (string.length >= tam){
        case true:
            return string.substring(0, tam-1);
        case false:
            return " ".repeat(tam-string.length) + string;
    }
}

const tipoProducto = prod => {
    if(prod instanceof ProductoPerecederoRefrigeracion){
        return "Refrigeracion";
    }
    else if(prod instanceof ProductoPerecedero){
        return "Perecedero";
    }
    else if(prod instanceof ProductoLineaBlanca){
        return "Linea blanca";
    }
    else if(prod instanceof Producto){
        return "Generico";
    }
    return "No es producto";
}

// --- START --- : Objetos de tipo Lista

/* Cliente */{
    function Cliente(nombre, apellido){
        Cliente.contador = ++Cliente.contador || 1;

        var id = Cliente.contador;
        this.nombre = nombre;
        this.apellido = apellido;
        this.carrito = new Carrito();
        
        this.getId = function(){
            return id;
        };
    }

    Object.defineProperty(Cliente.prototype, "id", {
        get() {return this.getId()}
    });

    Object.defineProperty(Cliente.prototype, "nombre", {
        set(nombre) {
            if (nombre.trim() == '') {
                console.log("[-] Ingrese el nombre del cliente");
            } else {
                this.nombreCliente = nombre.trim().split(/\s+/).join(' ');
            }
        }
    });

    Object.defineProperty(Cliente.prototype, "apellido", {
        set(apellido) {
            if (apellido.trim() == '') {
                console.log("[-] Ingrese el apellido del cliente");
            } else {
                this.apellidoCliente = apellido.trim().split(/\s+/).join(' ');
            }
        }
    });

    Cliente.prototype.presentarCliente = function() {
        console.log(`[+] Este es el cliente ${this.nombreCliente} ${this.apellidoCliente} (id: ${this.id})`);
    }

    Cliente.prototype.agregarProducto = function(producto, cantidad) {
        if (producto instanceof Producto) {
            this.carrito.agregarProducto(new ProductoEnCarrito(producto, cantidad));
        } else {
            console.log("[-] Solo puede agregar productos al carrito");
        }
    };

    Cliente.prototype.verCarrito = function() {
        this.carrito.mostrarCarrito();
    };

    Cliente.prototype.buscarProductoPorId = function(id) {
        return this.carrito.buscarProducto(id, this.carrito.buscarPorId);
    };

    Cliente.prototype.buscarProductoPorNombre = function(nombre) {
        return this.carrito.buscarProducto(nombre, this.carrito.buscarPorNombre);
    };

    Cliente.prototype.buscarProductoPorCostoMayor = function(costo) {
        return this.carrito.buscarProducto(costo, this.carrito.buscarPorCostoMayor);
    };

    Cliente.prototype.buscarProductoPorCantidad = function(cantidad) {
        return this.carrito.buscarProducto(cantidad, this.carrito.buscarPorCantidad);
    };

    Cliente.prototype.quitarProductoDelCarrito = function(id, razon) {
        this.carrito.quitarProducto(id, razon);
    };

    Cliente.prototype.comprar = function(stock) {
        this.carrito.confirmarCompra(stock);
    };
}

/* Lista */{
    function Lista(){
        this.listaProductos = [];
    }

    Lista.prototype.agregarProducto = function(producto) {
        this.listaProductos.push(producto);
    };

    Lista.prototype.agregarProductos = function(productos) {
        productos.forEach(producto => this.agregarProducto(producto));
    };

    //Inicio Callbacks
    Lista.prototype.buscarPorId = function(producto, id) {
        return producto.id == id;
    };

    Lista.prototype.buscarPorNombre = function(producto, nombre) {
        return producto.nombreProducto.includes(nombre);
    };

    Lista.prototype.buscarPorCostoMayor = function(producto, costo) {
        return producto.costoProducto >= costo;
    };

    Lista.prototype.buscarPorCantidad = function(producto, cantidad) {
        return producto.cantidadProducto == cantidad;
    };
    //Fin Callbacks

    Lista.prototype.buscarProducto = function(elementoBuscado, callback) {
        let producto = this.listaProductos.filter(producto => callback(producto, elementoBuscado));
        return producto.length == 0 ? "[-] No se han podido encontrar productos" : producto;
    };

    Lista.prototype.mostrarLista = function() {
        console.log("\n[+] Mostrando Stock:\n\n      [     id     ][      Nombre      ][       Tipo       ][  Precio C/U  ][ Cantidad Stock ]\n");
        let i = 0;
        this.listaProductos.forEach(producto => {
            let str = aTamanio(""+i, 4) + ")  " + aTamanio(producto.id + "", 11)+"   " + aTamanio(producto.nombreProducto, 17) + "   " +
            aTamanio(tipoProducto(producto), 17) + "   " + aTamanio(producto.costoProducto+"", 13) + "   " + aTamanio(producto.cantidadProducto+"", 15) +"\n";

            i++;
            console.log(str);
            
        });

        console.log("\n\n");
    };

}

/* Stock */{
    function Stock(){
        Lista.call(this);
    }

    //extends Lista
    Stock.prototype = Object.create(Lista.prototype);
    Stock.prototype.constructor = Stock.prototype;


    Stock.prototype.modificarProducto = function(id, nombre = '', costo = '') {
        let producto = this.buscarProducto(id, this.buscarPorId)[0];
        if (typeof(producto) == 'string') {
            console.log(producto);
        } else {
            producto.nombre = nombre == '' ? producto.nombreProducto : nombre;
            producto.costo = costo == '' ? producto.costoProducto : costo;
        }
    };
    
    Stock.prototype.actualizarStock = function(id, diferenciaStock) {
        let productoArr = this.buscarProducto(id, this.buscarPorId);
        if (typeof(productoArr) == 'string') {
            console.log(productoArr);
        } else {
            let producto = productoArr[0];
            /* 
                En vez de que solo se permita reducir la cantidad de artículos, cambio
                el método para que permita toda posibilidad de cambio de stock. Ahora
                son valores positivos para aumentar el stock y valores negativos para
                reducirlo.
            */ 

            if (producto.cantidadProducto + diferenciaStock >= 0 ) {
                producto.cantidadProducto += diferenciaStock;
            } else {
                console.log("[-] No hay suficientes artículos");
            }
        }
    }
    
    Stock.prototype.mostrarStock = function() {
        this.mostrarLista();
    }
}

/* Carrito */{
    function Carrito(){
        Lista.call(this);
    }

    //extends Lista
    Carrito.prototype = Object.create(Lista.prototype);
    Carrito.prototype.constructor = Carrito.prototype;

    Carrito.prototype.buscarPorCantidad = function(producto, cantidad) {
        return producto.cantidadAniadida == cantidad;
    };

    //@Override
    Carrito.prototype.agregarProducto = function(productoEnCarrito) {

        if(productoEnCarrito != undefined){
            let elem = this.buscarProducto(productoEnCarrito.prod.id, this.buscarPorId, 0)[0];
            if(elem != undefined){

                if(elem.cantidadAniadida + productoEnCarrito.cantidadAniadida <= productoEnCarrito.prod.cantidadProducto){
                    elem.cantidadAniadida += productoEnCarrito.cantidadAniadida;
                }
                else{
                    console.log("[-] No hay suficientes productos disponibles para satisfacer el pedido");
                }
            }
            else if(productoEnCarrito.validarDisponibilidad()){
                this.listaProductos.push(productoEnCarrito);
            }
            else{
                console.log("[-] No hay suficientes productos disponibles para satisfacer el pedido");
            }
        }

    };

    //@Override
    Carrito.prototype.agregarProductos = function(productosEnCarrito) {
        if(productosEnCarrito != undefined){
            productosEnCarrito.forEach((item) => {
                this.agregarProducto(item);
            });
        }
    };

    //@Override
    Carrito.prototype.buscarProducto = function(elementoBuscado, callback, flag /* opcional */) {
        let producto;
        if (callback == this.buscarPorCantidad) {
            producto = this.listaProductos.filter(producto => callback(producto, elementoBuscado));
        } else {
            producto = this.listaProductos.filter(producto => callback(producto.prod, elementoBuscado));
        }
        return producto.length == 0 && flag == undefined ? "[-] No se han podido encontrar productos" : producto;
    };

    Carrito.prototype.quitarProducto = function(id, razon /* Opcional */ ) {
        let productoEliminado = false;
        this.listaProductos.forEach( (item) => {

            if(id != undefined && item.prod.id == id){
                productoEliminado = true;
                if(razon === undefined){
                    console.log("Se eliminó el elemento " + item.prod.nombreProducto + " del carrito de compras.");
                }
                else{
                    console.log("Se eliminó el elemento " + item.prod.nombreProducto + " del carrito de compras.\nRazón: " + razon );
                }
                
                this.listaProductos.splice(this.listaProductos.indexOf(item), 1);
            }

        });
        if (!productoEliminado) {
            console.log("[-] No se ha encontrado el producto a eliminar");
        }
    };

    Carrito.prototype.mostrarCarrito = function() {
        console.log("\n[+] Mostrando Carrito:\n\n      [     id     ][      Nombre      ][       Tipo       ][  Precio C/U  ][ Cantidad Añadida ][     Total     ]\n");
        let i = 0;
        let suma =0;
        this.listaProductos.forEach(producto => {
            let str = aTamanio(""+i, 4) + ")  " + aTamanio(producto.prod.id + "", 11)+"   " + aTamanio(producto.prod.nombreProducto, 17) + "   " +
            aTamanio(tipoProducto(producto.prod), 17) + "   " + aTamanio(producto.prod.costoProducto + "", 13) + "   " + aTamanio(producto.cantidadAniadida + "", 17) + "   " + aTamanio("" + (producto.cantidadAniadida*producto.prod.costoProducto), 14) +"\n";

            i++;
            suma += producto.prod.costoProducto*producto.cantidadAniadida;
            console.log(str);
        });
        console.log(aTamanio(" ", 107) + suma + "\n\n");
    };

    Carrito.prototype.actualizarDatosCarrito = function(){
        this.listaProductos.forEach( (item) => {
            if(!item.validarDisponibilidad()){
                this.quitarProducto(item, "[-] Cambio en el stock actual no permite compras con tal disponibilidad.");
            }
        });
    };

    Carrito.prototype.confirmarCompra = function(stock) {
        this.listaProductos.forEach(producto => {
            let idProducto = producto.prod.getId();
            let cantidadCompra = producto.cantidadAniadida;
            let prodEnStock = stock.buscarProducto(idProducto, stock.buscarPorId)[0];
            if (prodEnStock.cantidadProducto >= cantidadCompra) {
                stock.actualizarStock(idProducto, -cantidadCompra);
            } else {
                console.log(`[-] No puede realizarse la compra del producto "${producto.prod.nombreProducto}" por falta de stock`);
            }
        });
        this.listaProductos = [];
    };
}

// --- START --- : Objetos de Tipo productos

/* Producto */{
    function Producto(nombre, costo, cantidad){
        Producto.contador = ++Producto.contador || 1;

        var id = Producto.contador;
        this.nombre = nombre;
        this.costo = costo;
        this.cantidad = cantidad;

        this.getId = function(){
            return id;
        };

    }

    Object.defineProperty(Producto.prototype, "id", {
        get() {return this.getId()}
    });

    Object.defineProperty(Producto.prototype, "nombre", {
        set(nombre) {
            if (nombre.trim() == '') {
                console.log("[-] Ingrese el nombre del producto");
            } else {
                this.nombreProducto = nombre.trim().split(/\s+/).join(' ');
            }
        }
    });

    Object.defineProperty(Producto.prototype, "costo", {
        set(costo) {
            if (costo > 0) {
                this.costoProducto = costo;
            } else {
                console.log("[-] Valor para el costo incorrecto");
            }
        }
    });

    Object.defineProperty(Producto.prototype, "cantidad", {
        set(cantidad) {
            if (cantidad > 0) {
                this.cantidadProducto = cantidad;
            } else {
                console.log("[-] Valor para la cantidad incorrecto");
            }
        }
    });

    Producto.prototype.mostrarProducto = function() {
        console.log("\n[+] Mostrando Producto:");
        console.log(`\t>> Producto: ${this.nombreProducto}\n\t>> Costo: ${this.costoProducto}\n\t>> Cantidad Restante: ${this.cantidadProducto}`);
    };
}



/* ProductoLineaBlanca */{
    function ProductoLineaBlanca(nombre, costo, cantidad, dimensiones){
        Producto.call(this, nombre, costo, cantidad);

        this.dimensiones = dimensiones;
    }

    //extends Producto
    ProductoLineaBlanca.prototype = Object.create(Producto.prototype);
    ProductoLineaBlanca.prototype.constructor = ProductoLineaBlanca.prototype;
    
    Object.defineProperty(ProductoLineaBlanca.prototype, "dimensiones", {
        get() {return this.dimensionesProducto.imprimirDimensiones()},
        set(dimensiones) {dimensiones == undefined ? console.log("[-] Por favor, definir dimensiones") : this.dimensionesProducto = dimensiones}
    });

    ProductoLineaBlanca.prototype.mostrarProducto = function() {
        Producto.prototype.mostrarProducto.call(this);
        console.log(`\t>> Dimensiones: ${this.dimensiones}`);
    }
}

/* ProductoPerecedero */{
    function ProductoPerecedero(nombre, costo, cantidad, fechaCaducidad){
        Producto.call(this, nombre, costo, cantidad);
        
        this.fecha = fechaCaducidad;
    }

    //extends Producto
    ProductoPerecedero.prototype = Object.create(Producto.prototype);
    ProductoPerecedero.prototype.constructor = ProductoPerecedero.prototype;

    Object.defineProperty(ProductoPerecedero.prototype, "fecha", {
        set(fecha) {
            let fechaArr = fecha.split("/");
        
            if (fechaArr.length == 3) {
                let fechaParse = Date.parse(`${fechaArr[1]}/${fechaArr[0]}/${fechaArr[2]}`);
                
                if (isNaN(fechaParse)) {
                    console.log("[-] Fecha Invalida");
                } else {
                    if (fechaParse - Date.now() > 0) {
                        this.fechaCaducidad = fecha;
                    } else {
                        console.log("[-] Este producto ya vencio!");
                    }
                }
            } else {
                console.log("[-] Fecha Invalida");
            }
        }
    });

    ProductoPerecedero.prototype.mostrarProducto = function() {
        Producto.prototype.mostrarProducto.call(this);
        console.log(`\t>> Fecha de Vencimiento: ${this.fechaCaducidad}`);
    }
}

/* ProductoPerecederoRefrigeracion */{
    function ProductoPerecederoRefrigeracion(nombre, costo, cantidad, fechaCaducidad, tipoRefrigeracion){
        ProductoPerecedero.call(this, nombre, costo, cantidad, fechaCaducidad);
        
        this.refrigeracion = tipoRefrigeracion;
    }

    //extends ProductoPerecedero
    ProductoPerecederoRefrigeracion.prototype = Object.create(ProductoPerecedero.prototype);
    ProductoPerecederoRefrigeracion.prototype.constructor = ProductoPerecederoRefrigeracion.prototype;

    ProductoPerecederoRefrigeracion.prototype.mostrarProducto = function() {
        ProductoPerecedero.prototype.mostrarProducto.call(this);
        console.log(`\t>> Tipo de Refrigeracion: ${this.tipoRefrigeracion}`);
    }

    Object.defineProperty(ProductoPerecederoRefrigeracion.prototype, "refrigeracion", {
        set(tipo) {tipo == undefined ? console.log("[-] Por favor, definir tipo de refrigeracion") : this.tipoRefrigeracion = tipo}
    });
}

// --- START --- : Objetos Auxiliares

/* ProductoEnCarrito */{
    function ProductoEnCarrito(prod, cantidadAniadida){
        this.prod = prod;
        this.cantidadAniadida = cantidadAniadida;
    }

    ProductoEnCarrito.prototype.validarDisponibilidad = function(){
        return this.prod.cantidadProducto >= this.cantidadAniadida;
    };

    ProductoEnCarrito.prototype.mostrarProducto = function() {
        this.prod.mostrarProducto();
        console.log(`\t>> Cantidad Añadida: ${this.cantidadAniadida}`);
    }
}

/* Dimensiones */{
    function Dimensiones(alto, ancho, profundidad){
        this.alto = alto;
        this.ancho = ancho;
        this.profundidad = profundidad;
    }

    Dimensiones.prototype.imprimirDimensiones = function(){
        return this.altoProducto + " x " + this.anchoProducto + " x " + this.profundidadProducto;
    };

    Object.defineProperty(Dimensiones.prototype, "alto", {
        set(alto) {
            if (alto> 0) {
                this.altoProducto = alto;
            } else {
                console.log("[-] La medida de altura es invalida");
            }
        }
    });

    Object.defineProperty(Dimensiones.prototype, "ancho", {
        set(ancho) {
            if (ancho> 0) {
                this.anchoProducto = ancho;
            } else {
                console.log("[-] La medida de ancho es invalida");
            }
        }
    });

    Object.defineProperty(Dimensiones.prototype, "profundidad", {
        set(profundidad) {
            if (profundidad> 0) {
                this.profundidadProducto = profundidad;
            } else {
                console.log("[-] La medida de profundidad es invalida");
            }
        }
    });
}

// --- START --- : Programa
console.log("[1] Creación de Productos\n\n");
let producto1 = new Producto("Detergente", 50, 30);
let producto2 = new Producto("Lata de Atun", 90, 80);
let dimensionesHeladera = new Dimensiones(1.6, 0.6, 0.9);
let producto3 = new ProductoLineaBlanca("Heladera", 30000, 5, dimensionesHeladera);
let producto4 = new ProductoPerecedero("Queso en Fetas", 60, 150, "3/1/22");
let producto5 = new ProductoPerecederoRefrigeracion("Maneteca", 60, 150, "16/10/21", "Conservar en la heladera");
producto1.mostrarProducto();
producto2.mostrarProducto();
producto3.mostrarProducto();
producto4.mostrarProducto();
producto5.mostrarProducto();

console.log("\n[1.1] Ejemplos de creaciones fallidas de productos");
let productoDummie;
let dimensionesDummie;
console.log("\n[1.1.1] Cantidad y/o costo inválidos:");
productoDummie = new Producto("Dummie", -50, -6);
console.log("\n[1.1.2] Dimensiones Vacías:");
productoDummie = new ProductoLineaBlanca("Dummie", 50, 6);
console.log("\n[1.1.3] Dimensiones Inválidas:");
dimensionesDummie = new Dimensiones(-5, -6, -1);
console.log("\n[1.1.4] Fecha de Formato Inválido:");
productoDummie = new ProductoPerecedero("Dummie", 50, 6, "10/9");
console.log("\n[1.1.5] Fecha de Pasada:");
productoDummie = new ProductoPerecedero("Dummie", 50, 6, "10/9/20");
console.log("\n[1.1.6] Tipo de refigeración Vacío:");
productoDummie = new ProductoPerecederoRefrigeracion("Dummie", 50, 6, "10/9/22");
console.log("\n[1.1.7] Producto sin Nombre:");
productoDummie = new Producto("", 50, 6);


console.log("\n\n[2] Creación del Stock\n\n");
let stock = new Stock();
stock.agregarProductos([producto1, producto2, producto3, producto4, producto5]);
stock.mostrarStock();

console.log("\n[2.1] Haciendo uso de las funcionalidades del Stock");
console.log("\n[2.1.1] Modificando Costos y Nombres:");
stock.modificarProducto(5, 'Manteca');
stock.modificarProducto(2, '', 110);
stock.mostrarStock();

console.log("\n[2.1.2] Actualización de las cantidades disponibles en el stock:");
stock.actualizarStock(1, -5);
stock.actualizarStock(3, 10);
stock.mostrarStock();

console.log("\n[2.1.3] Búsqueda de Productos:");
let productosEncontrados;
console.log("\n[2.1.3.1] Por id:");
productosEncontrados = stock.buscarProducto(3, stock.buscarPorId);
productosEncontrados.forEach(producto => producto.mostrarProducto());
console.log("\n[2.1.3.1] Por nombre:");
productosEncontrados = stock.buscarProducto("en", stock.buscarPorNombre);
productosEncontrados.forEach(producto => producto.mostrarProducto());
console.log("\n[2.1.3.1] Por costo mayor a:");
productosEncontrados = stock.buscarProducto(100, stock.buscarPorCostoMayor);
productosEncontrados.forEach(producto => producto.mostrarProducto());
console.log("\n[2.1.3.1] Por cantidad:");
productosEncontrados = stock.buscarProducto(15, stock.buscarPorCantidad);
productosEncontrados.forEach(producto => producto.mostrarProducto());

console.log("\n[2.2] Generando Errores");
console.log("\n[2.2.1] Actualización a Costo negativo:");
stock.modificarProducto(2, '', -1110);
console.log("\n[2.2.2] Actualizando Stock de Producto a cantidad menor a 0:");
stock.actualizarStock(1, -10000);
console.log("\n[2.2.3] Búsqueda fallida:");
console.log(stock.buscarProducto(30, stock.buscarPorId));
console.log("\n[2.2.4] Actualizando Stock de Producto que no existe:");
stock.actualizarStock(30, 10000);

console.log("\n\n[3] Armado del cliente\n\n");
let cliente = new Cliente("Juan", "Perez");
cliente.presentarCliente();

console.log("\n[3.1] Carrito Vacío:");
cliente.verCarrito();

console.log("\n[3.2] Carga del Carrito:");
cliente.agregarProducto(producto1, 5);
cliente.agregarProducto(producto3, 1);
cliente.agregarProducto(producto5, 10);
cliente.verCarrito();
console.log("\n[3.2.1] Cargando al carrito un producto ya cargado:");
cliente.agregarProducto(producto1, 5);
cliente.verCarrito();
console.log("\n[3.2.2] Mostrando Stock (aun no modificado):");
stock.mostrarStock();

console.log("\n[3.3] Busqueda en el Carrito:");
console.log("\n[3.3.1] Por Id:");
productosEncontrados = cliente.buscarProductoPorId(3);
productosEncontrados.forEach(producto => producto.mostrarProducto());
console.log("\n[3.3.2] Por nombre:");
productosEncontrados = cliente.buscarProductoPorNombre("en");
productosEncontrados.forEach(producto => producto.mostrarProducto());
console.log("\n[3.3.3] Por costo mayor a:");
productosEncontrados = cliente.buscarProductoPorCostoMayor(100);
productosEncontrados.forEach(producto => producto.mostrarProducto());
console.log("\n[3.3.4] Por cantidad:");
productosEncontrados = cliente.buscarProductoPorCantidad(10);
productosEncontrados.forEach(producto => producto.mostrarProducto());

console.log("\n[3.4] Quitando un producto del Carrito:");
cliente.quitarProductoDelCarrito(3, "Es muy caro");
cliente.verCarrito();

console.log("\n[3.5] Realización de la Compra:");
cliente.comprar(stock);
console.log("\n[3.5.1] Carrito luego de la Compra:");
cliente.verCarrito();
console.log("\n[3.5.2] Stock luego de la Compra:");
stock.mostrarStock();

console.log("\n[3.6] Validaciones del Cliente:");
let clienteDummie;
console.log("\n[3.6.1] Ausencia de nombre y/o apellido:");
clienteDummie = new Cliente("", "");
console.log("\n[3.6.2] Regex para el nombre y el apellido:");
let [nombre, apellido] = ["  Juan   Rogelio    ", "Diaz     de     la   Cruz   "];
clienteDummie = new Cliente(nombre, apellido);
clienteDummie.presentarCliente();

console.log("\n\n[4] Validaciones del Carrito\n\n");
console.log("\n[4.1] Agregando al Carrito algo que no es Producto:");
cliente.agregarProducto("Esto NO es un Producto", 15000);

console.log("\n[4.2] Búsqueda Fallida:");
console.log(cliente.buscarProductoPorId(15000));

console.log("\n[4.3] Quitando un producto que no existe del Carrito:");
cliente.quitarProductoDelCarrito(30, "No existe");

console.log("\n[4.4] Agregando productos de más al carrito:");
cliente.agregarProducto(producto3, 150);
cliente.verCarrito();

console.log("\n[4.5] Agregando productos tal que el total en el carrito supere al total del stock:");
cliente.agregarProducto(producto3, 14);
cliente.agregarProducto(producto3, 15);
cliente.verCarrito();

console.log("\n[4.6] Realizando una compra cuando el Stock se modificó y las cantidades disponibles son inferiores a las seleccionadas para el carrito:");
cliente.agregarProducto(producto1, 10);
cliente.agregarProducto(producto2, 30);
cliente.verCarrito();
stock.mostrarStock();
console.log(">> Se reduce en 6 unidades el stock del producto 1 para generar el problema");
stock.actualizarStock(1, -6);
stock.mostrarStock();
console.log(">> A continuación se realiza la compra; se intentarán comprar 10 unidades del producto 1; sin embargo, solo hay 9 disponibles");
cliente.comprar(stock);
cliente.verCarrito();
stock.mostrarStock();
console.log(">> Noar que la cantidad del producto 1 no cambió. La del 2 sí, debido a que de este sí había stock");



// cliente1 = new Cliente("Juan", "");
// cliente1 = new Cliente("  Juan Roger   ", "Perez");
// console.log(cliente1);
// let cliente2 = new Cliente("Marcelo", "Beiner");
// let cliente3 = new Cliente("Hipolito", "Gomez");
// console.log(cliente2, cliente2.getId(), cliente2.id);
// console.log(cliente3, cliente3.getId(), cliente3.id);

// cliente1.agregarProducto(producto1, 2);
// console.log(cliente1, cliente1.getId(), cliente1.id);
// stock.actualizarStock(1, -1);
// stock.mostrarStock();
// cliente.agregarProducto(producto2, 40);
// cliente.verCarrito();
//cliente.comprar(stock);
//cliente.verCarrito();
//stock.mostrarStock();

//console.log(cliente.buscarProductoPorId(1));
//console.log(cliente.buscarProductoPorCantidad(79));

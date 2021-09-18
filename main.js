// --- START --- : Objetos de tipo Lista

/* Cliente */{
    function Cliente(nombre, apellido){
        Cliente.contador = ++Cliente.contador || 1;

        var id = contador;
        this.nombre = nombre;
        this.apellido = apellido;
        this.carrito = new Carrito();
        
        this.getId = function(){
            return id;
        };

    }

    Cliente.prototype.agregarProducto = function(producto, cantidad) {
        this.carrito.agregarProducto(new ProductoEnCarrito(producto, cantidad));
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

    Cliente.prototype.buscarProductoPorCosto = function(costo) {
        return this.carrito.buscarProducto(costo, this.carrito.buscarPorCosto);
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
        return producto.getId() == id;
    };

    Lista.prototype.buscarPorNombre = function(producto, nombre) {
        return producto.nombreProducto.includes(nombre);
    };

    Lista.prototype.buscarPorCosto = function(producto, costo) {
        return producto.costoProducto == costo;
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
        this.listaProductos.forEach(producto => console.log(producto));
    };

}

/* Stock */{
    function Stock(){
        Lista.call(this);
    }

    //extends Lista
    Stock.prototype = Object.create(Lista.prototype);
    Stock.prototype.constructor = Stock.prototype;


    Stock.prototype.modificarProducto = function(id, nombre, costo) {
        let producto = this.buscarProducto(id, this.buscarPorId)[0];
        if (typeof(producto) == 'string') {
            console.log(producto);
        } else {
            producto.nombreProducto = nombre == '' ? producto.nombreProducto : nombre;
            producto.costoProducto = costo == '' ? producto.costoProducto : costo;
        }
    };
    
    Stock.prototype.actualizarStock = function(id, diferenciaStock) {
        let producto = this.buscarProducto(id, this.buscarPorId)[0];
        if (typeof(producto) == 'string') {
            console.log(producto);
        } else {
            /* 
                En vez de que solo se permita reducir la cantidad de artículos, cambio
                el método para que permita toda posibilidad de cambio de stock. Ahora
                son valores positivos para aumentar el stock y valores negativos para
                reducirlo.
            */ 

            if (producto.cantidadProducto + diferenciaStock >= 0 ) {
                producto.cantidadProducto += diferenciaStock;
            } else {
                console.log(producto.cantidadProducto + ", " + diferenciaStock);
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


    //@Override
    Carrito.prototype.agregarProducto = function(productoEnCarrito) {

        if(productoEnCarrito != undefined){
            let elem = this.buscarProducto(productoEnCarrito.prod.getId(), this.buscarPorId, 0)[0];
            if(elem != undefined){

                if(elem.cantidadAniadida + productoEnCarrito.cantidadAniadida <= productoEnCarrito.prod.cantidadProducto){
                    this.elem.cantidadAniadida += productoEnCarrito.cantidadAniadida;
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
        let producto = this.listaProductos.filter(producto => callback(producto.prod, elementoBuscado));
        return producto.length == 0 && flag == undefined ? "[-] No se han podido encontrar productos" : producto;
    };

    Carrito.prototype.quitarProducto = function(id, razon /* Opcional */ ) {
        this.listaProductos.forEach( (item) => {

            if(id != undefined && item.prod.getId() == id){
                
                if(razon === undefined){
                    console.log("Se eliminó el elemento " + item.prod.nombreProducto + " del carrito de compras.");
                }
                else{
                    console.log("Se eliminó el elemento " + item.prod.nombreProducto + " del carrito de compras.\nRazón: " + razon );
                }
                
                this.listaProductos.splice(this.listaProductos.indexOf(item), 1);
            }

        });
    };

    Carrito.prototype.mostrarCarrito = function() {
        this.mostrarLista();
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

        var id = contador;
        this.nombreProducto = nombre;
        this.costoProducto = costo;
        this.cantidadProducto = cantidad;

        this.getId = function(){
            return id;
        };

    }
}

/* ProductoLineaBlanca */{
    function ProductoLineaBlanca(nombre, costo, cantidad, dimensiones){
        Producto.call(this, nombre, costo, cantidad);

        this.dimensiones = dimensiones;
    }

    //extends Producto
    ProductoLineaBlanca.prototype = Object.create(Producto.prototype);
    ProductoLineaBlanca.prototype.constructor = ProductoLineaBlanca.prototype;
}

/* ProductoPerecedero */{
    function ProductoPerecedero(nombre, costo, cantidad, fechaCaducidad){
        Producto.call(this, nombre, costo, cantidad);
        
        this.fechaCaducidad = fechaCaducidad;
    }

    //extends Producto
    ProductoPerecedero.prototype = Object.create(Producto.prototype);
    ProductoPerecedero.prototype.constructor = ProductoPerecedero.prototype;
}

/* ProductoPerecederoRefrigeracion */{
    function ProductoPerecederoRefrigeracion(nombre, costo, cantidad, fechaCaducidad, tipoRefrigeracion){
        ProductoPerecedero.call(this, nombre, costo, cantidad, fechaCaducidad);
        
        this.tipoRefrigeracion = tipoRefrigeracion;
    }

    //extends ProductoPerecedero
    ProductoPerecederoRefrigeracion.prototype = Object.create(ProductoPerecedero.prototype);
    ProductoPerecederoRefrigeracion.prototype.constructor = ProductoPerecederoRefrigeracion.prototype;
}

// --- START --- : Objetos Auxiliares

/* ProductoEnCarrito */{
    function ProductoEnCarrito(prod, cantidadAniadida){
        this.prod = prod;
        this.cantidadAniadida = cantidadAniadida;
    }

    ProductoEnCarrito.prototype.validarDisponibilidad = function(){
        return this.prod.cantidadProducto >= this.cantidadAniadida;
    }
}

/* Dimensiones */{
    function Dimensiones(alto, ancho, profundidad){
        if (alto> 0) {
            this.alto = alto;
        } else {
            console.log("[-] La medida de altura es invalida");
        }

        if (ancho > 0) {
            this.ancho = ancho;
        } else {
            console.log("[-] La medida de ancho es invalida");
        }
        
        if (profundidad > 0) {
            this.profundidad = profundidad;
        } else {
            console.log("[-] La medida de profundidad es invalida");
        }

    }

    Dimensiones.prototype.imprimirDirecciones = function(){
        return this.alto + "x" + this.ancho + "x" + this.profundidad;
    }
}

// --- START --- : Programa
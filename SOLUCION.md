# Solución

En este documento explico los errores que encontré en Tienda, cómo los corregí y qué más alcancé a mejorar.

## Tickets

### T1 — El carrito tarda en actualizarse y el total no cuadra
- **Causa raíz:** al agregar un producto se modificaba directamente el arreglo del carrito y React no detectaba el cambio. Por eso a veces había que esperar a que el reloj de la aplicación actualizara la pantalla. El total también se calculaba por separado y podía quedar desfasado.
- **Solución:** cambié las funciones para agregar y quitar productos, de forma que actualicen el estado sin modificar el arreglo anterior. Ahora el total se calcula directamente a partir de los productos y sus cantidades. También cambié la identificación de cada elemento de la lista para usar el ID del producto.
- **Cómo lo verifiqué:** agregué productos al carrito y comprobé que las cantidades y el total se reflejaran inmediatamente, sin tener que esperar a que se actualizara el reloj.

### T2 — Los pedidos se guardan con total $0
- **Causa raíz:** el sistema intentaba guardar el pedido antes de terminar de calcular los precios. El problema estaba en un `forEach` con operaciones asíncronas que no esperaba a que terminaran.
- **Solución:** lo cambié por un `for...of` con `await` para terminar de calcular cada producto antes de guardar el pedido. Además, tomé el precio desde la base de datos en lugar de confiar en el valor enviado desde el navegador.
- **Cómo lo verifiqué:** probé la creación de pedidos con varios productos y revisé que el total guardado correspondiera a la suma de precios y cantidades. En una prueba, dos unidades de un producto de 59.9 dieron un total de 119.8.

### T3 — La API se cae cuando no hay suficiente stock
- **Causa raíz:** cuando un usuario pedía más unidades de las disponibles, el error se generaba dentro de una operación asíncrona que no se manejaba correctamente. Eso podía cerrar la API. También encontré que el stock se consultaba y descontaba en pasos separados, lo que podía traer problemas con pedidos simultáneos.
- **Solución:** ahora se comprueba que haya unidades suficientes y se descuentan en una sola operación con `findOneAndUpdate`. Si falla un producto del pedido, el sistema intenta devolver las unidades descontadas anteriormente y responde con un error claro. También activé las validaciones del backend para rechazar cantidades inválidas.
- **Cómo lo verifiqué:** intenté comprar más unidades de las disponibles de un producto junto con otro válido. La API respondió con error 400, el primer producto conservó su stock y el servidor siguió funcionando. También comprobé que una cantidad negativa se rechaza.

### T4 — La sección de pedidos es lenta y empeora con el tiempo
- **Causa raíz:** para mostrar los pedidos, el backend hacía demasiadas consultas a la base de datos: buscaba los datos del cliente y los productos por separado para cada pedido. Además, la pantalla creaba intervalos para consultar pedidos cada cinco segundos, pero no los limpiaba al salir o cambiar filtros.
- **Solución:** organicé la consulta para traer los clientes y productos necesarios en grupos, en vez de buscarlos uno por uno. En el frontend agregué la limpieza del intervalo cuando deja de utilizarse.
- **Cómo lo verifiqué:** comparé los tiempos de `GET /orders` antes y después con el mismo conjunto de 807 pedidos. Pasó de 1,6–2,0 s a 0,08–0,12 s. La limpieza del intervalo no la medí con la pestaña Network del navegador.

### T5 — El buscador y la página se sienten lentos
- **Causa raíz:** el reloj estaba dentro del componente principal y provocaba actualizaciones de casi toda la pantalla cada segundo, incluso cuando no se estaba haciendo nada. En esas actualizaciones también se volvían a ordenar miles de productos. Por otro lado, el buscador enviaba una solicitud por cada letra.
- **Solución:** separé el reloj en su propio componente para que no actualice el resto de la aplicación. Mejoré la forma de ordenar los productos y evité actualizaciones innecesarias de algunos componentes (`useMemo`, `useCallback`). También ajusté el buscador para que espere 300 ms después de escribir antes de consultar, y para ignorar resultados de búsquedas anteriores que lleguen tarde.
- **Cómo lo verifiqué:** al comparar los métodos de ordenamiento, el proceso para unos 5.000 productos pasó de aproximadamente 370 ms a 13 ms. También comprobé que, al escribir varias letras seguidas, no se enviara una solicitud por cada una. No medí los re-renders con el Profiler de React DevTools.

### T6 — Una búsqueda con paréntesis deja la pantalla en blanco
- **Causa raíz:** el backend convertía el texto del buscador directamente en una expresión regular. Si alguien escribía algo como `camisa (talla`, se generaba un error. El frontend no manejaba bien esa respuesta y terminaba intentando mostrarla como si fueran productos.
- **Solución:** ajusté la búsqueda para tratar los caracteres especiales como texto normal. También agregué un manejo de errores en el frontend, de modo que una respuesta incorrecta de la API no haga que desaparezca toda la pantalla.
- **Cómo lo verifiqué:** probé búsquedas como `camisa (talla`, `[` y `.*`. Antes algunas devolvían errores 500 o resultados que no correspondían (`.*` devolvía los 5.003 productos); después respondieron sin romper la aplicación. Por ejemplo, `camisa (talla` devolvió un resultado con respuesta 200.

### T7 — La pestaña de estadísticas no funciona
- **Causa raíz:** había varios problemas. La ruta `top-products` se confundía con la ruta que busca un pedido por ID, el límite de resultados no se validaba y la pantalla repetía peticiones continuamente. Además, para calcular los productos más vendidos se recorrían demasiados datos y podía fallar si un producto había sido eliminado.
- **Solución:** corregí el orden de las rutas y la validación del límite. También ajusté la pantalla para evitar las peticiones repetidas. Para el ranking de productos más vendidos utilicé una consulta de agregación de MongoDB, y cuando un producto ya no existe se muestra como “Producto eliminado”.
- **Cómo lo verifiqué:** `GET /orders/top-products` pasó de responder con error 500 a devolver el ranking. Probé también límites inválidos y comprobé que respondieran con error 400. La pestaña de estadísticas ya muestra los resultados sin repetir continuamente la misma solicitud.

## Nueva funcionalidad

### Paginación y filtros de productos
Antes, la aplicación traía los productos y los ordenaba y filtraba en el navegador. Esto hacía más pesada la carga de la página. Cambié el funcionamiento para que MongoDB haga ese trabajo y el frontend reciba solamente los productos de la página solicitada.

- **API:** `GET /products` ahora recibe `page`, `limit`, `search` y `category`, y devuelve `{ data, total, page, limit }`. También agregué `sort` para conservar las opciones de ordenamiento que ya tenía la pantalla.
- **Consultas:** el filtro, el orden y la paginación se aplican directamente en MongoDB. Agregué índices para mejorar los listados y un orden estable por ID cuando dos productos tienen el mismo nombre o precio.
- **Validaciones:** por defecto se muestran 20 productos por página y el máximo es 100. Si llegan páginas, límites o filtros inválidos, la API los rechaza.
- **Frontend:** agregué los botones Anterior y Siguiente, el número de página y opciones de 20, 50 o 100 registros. El selector de categorías se llena desde la API. Cuando cambia un filtro o la búsqueda, se vuelve a la primera página. La búsqueda también espera 300 ms para no hacer una petición por tecla.
- **Cómo lo verifiqué:** revisé que la API devolviera el número solicitado de productos, que el total coincidiera con los filtros y que los valores fuera de rango respondieran con error 400. También probé la navegación entre páginas y los filtros desde la interfaz.
- **Limitación:** la búsqueda usa una regex sin ancla, que no aprovecha un índice normal. Con un catálogo mucho más grande habría que usar un índice de texto.

## Mejoras adicionales

### Carrito
Agregué botones + y − para cambiar las cantidades tanto desde la tarjeta del producto como desde el carrito. Las dos vistas muestran la misma cantidad. También limité la selección según el stock disponible y el máximo de 10 unidades por producto permitido por la API.

Ahora el carrito informa cuando una compra se completa o cuando ocurre un error, en lugar de depender de alertas. Mientras se procesa un pedido se deshabilita el botón para evitar un doble envío. Al finalizar, se vacía el carrito, se limpia el cliente seleccionado y se vuelve a consultar el stock.

Además, incorporé una búsqueda de clientes por nombre o correo y ajusté el cálculo y el formato de los precios para evitar números con demasiados decimales.

### Pedidos
Agregué paginación y filtros por estado, nombre del cliente y fechas. Estos filtros se aplican desde el backend, y en la pantalla también hay un botón para limpiarlos.

La tabla ahora muestra un resumen de los productos de cada pedido y permite desplegar el detalle con cantidades, precios y subtotales. También permite cambiar el estado de un pedido siguiendo las transiciones permitidas. Cuando se cancela, el sistema devuelve las unidades al inventario.

### Estadísticas
Aproveché la corrección del ticket T7 para mejorar la pantalla. Ahora muestra datos generales de pedidos e ingresos, productos con poco stock, pedidos por estado, ventas mensuales y los productos más vendidos.

Hice las gráficas con componentes sencillos de HTML y CSS, sin añadir una librería adicional. También aproveché mejor el espacio ocultando el carrito en esta sección sin perder su contenido. Comprobé que los totales mostrados coincidieran con las respuestas de la API. Los datos mensuales se calculan en UTC, y los datos de prueba solo cubren unos 6 meses, por eso los meses anteriores aparecen en 0.

### Búsqueda sin tildes
Noté que buscar `audifonos` no encontraba `Audífonos`. Ajusté la búsqueda para que funcione con o sin tildes y sin distinguir mayúsculas. El mismo comportamiento se aplica a la búsqueda de clientes dentro de Pedidos.

### Validaciones y seguridad
También encontré problemas que no estaban mencionados en los tickets y corregí varios de ellos:
- La API ahora valida cantidades, precios, IDs y parámetros de búsqueda antes de procesarlos.
- Un ID incorrecto devuelve error 400 y un recurso que no existe responde 404.
- El backend obtiene los precios reales de los productos y no acepta el precio enviado desde el carrito para calcular el pedido.
- Las descripciones de productos ya no se insertan como HTML, evitando que se ejecuten etiquetas o scripts incluidos en esos textos.
- Restringí CORS mediante una variable de entorno.
- Las contraseñas de clientes dejaron de incluirse en las respuestas de la API.

### Configuración e interfaz
Dejé ejemplos de variables de entorno para configurar la conexión a MongoDB, el puerto, CORS y la URL de la API, sin romper los pasos originales para levantar el proyecto. También agregué la documentación de los endpoints con Swagger en `/api/docs`.

Por último, hice ajustes visuales en las tarjetas, los botones, la tabla de pedidos y las estadísticas. Agregué mensajes de carga, error y listas vacías para que sea más claro qué está pasando en cada pantalla.

## Cómo hice las pruebas
Probé los flujos principales de la aplicación: búsqueda y paginación de productos, cambios en el carrito, creación de pedidos, filtros y cambio de estado, y consulta de estadísticas. Las APIs las probé desde el navegador con Swagger (`/api/docs`), incluidos casos de error como cantidades inválidas, falta de stock y parámetros incorrectos.


## Si tuviera más tiempo…
De la lista de mejoras opcionales de la prueba ya hice: configuración por variables de entorno, mejor manejo de errores y estados de carga/vacío, editar la cantidad desde el carrito, cambiar el estado de un pedido desde la UI y Swagger. Lo que haría después, en este orden:

1. **Autenticación y contraseñas con hash (bcrypt).** Hoy cualquiera puede llamar a cualquier endpoint y las contraseñas del seed están en texto plano.
2. **Actualizar las dependencias** con vulnerabilidades reportadas por `npm audit`.
3. **Dockerizar** backend y frontend en el `docker-compose.yml`.
4. **Búsqueda con índice de texto** en vez de regex sin ancla, si el catálogo crece.
5. **Migrar el frontend a TypeScript.**

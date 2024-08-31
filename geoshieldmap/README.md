#GEOSHIELD frontal

## Descripción general
La interfaz de GEOSHIELD es una interfaz de usuario creada con **React** y **Google Maps** para proporcionar una forma interactiva e intuitiva para que los usuarios visualicen, filtren y analicen datos relacionados con amenazas a la seguridad, antisemitismo y desastres naturales. La interfaz de usuario integra varias llamadas API al sistema back-end para recuperar y mostrar datos.

##Tecnologías clave
- **React**: el marco principal utilizado para construir la interfaz.
- **Google Maps**: se utiliza para representar la interfaz del mapa interactivo y mostrar datos geoespaciales.

##Componentes
La base del código de front-end está organizada en varios componentes ubicados en el directorio `geoshieldmap/src/components/`. A continuación se muestra una explicación de cada componente:

### elementos del mapa
- **GoogleMap.js**:
 El componente principal responsable de representar el mapa de Google y proporcionar funciones relacionadas, como hacer zoom, desplazarse e interactuar con marcadores del mapa.

- **MarcadorPoints.js**:
 Maneja la visualización de puntos fijos en el mapa, que representan información básica recopilada de diversas fuentes.

- **MarkerPointsMatching.js**:
 Gestiona la visualización de puntos de datos coincidentes que representan datos coincidentes dentro del sistema.

### Componentes de visualización de datos
- **Graph.js**:
 Un componente de visualización de datos que utiliza varios tipos de gráficos, lo que permite a los usuarios ver tendencias y patrones en los datos recopilados.

- **IconExplain.js**:
 Este componente importa íconos para diferentes categorías de datos y muestra una leyenda (o "menú bíblico") para ayudar a los usuarios a comprender los símbolos y categorías del mapa.

### Título y controles
- **MapHeader.js**:
 Muestra el título de la interfaz del mapa, incluidos controles para seleccionar datos, seleccionar un rango de fechas y opciones para la recuperación de datos personalizados.

### Componentes de manejo de datos
- **IntervalHandler.js**:
 Gestiona comprobaciones periódicas de la cola SQS en busca de mensajes relevantes. Utiliza intervalos para llamar repetidamente a la función 'listenSqs' y manejar las respuestas, asegurando actualizaciones de datos en tiempo real.

- **Puntos.js**:
 Maneja varias llamadas API para obtener información filtrada del backend, según criterios seleccionados por el usuario, como rangos de fechas, categorías y geografías.

- **Sqs.js**:
 Supervise los datos entrantes escuchando una cola SQS. Espera notificaciones que indiquen que datos específicos están listos para mostrarse, lo que garantiza que el usuario reciba la información más actualizada.

## El comienzo del trabajo.
Para comenzar con la placa frontal GEOSHIELD:

1. Duplica este repositorio.
2. Navegue hasta el directorio `geoshieldmap`.
3. Instale las dependencias ejecutando `npm install`.
4. Inicie el servidor de desarrollo con `npm start`.

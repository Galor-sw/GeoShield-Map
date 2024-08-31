# GEOSHIELD front

## Overview
The GEOSHIELD frontend is a user interface built using **React** and **Google Maps** to provide an interactive and intuitive way for users to visualize, filter and analyze data related to security threats, antisemitism and natural disasters. The user interface integrates various API calls to the back-end system to fetch and display data.

##Key technologies
- **React**: the main framework used to build the frontend.
- **Google Maps**: Used to render the interactive map interface and display geospatial data.

##Components
The front-end code base is organized into several components located in the `geoshieldmap/src/components/` directory. Below is an explanation of each component:

### map elements
- **GoogleMap.js**:
 The main component responsible for rendering the Google Map and providing related functionality such as zooming, panning and interacting with map markers.

- **MarkerPoints.js**:
 Handles the display of fixed points on the map, which represent basic information collected from various sources.

- **MarkerPointsMatching.js**:
 Manages the display of matched data points that represent matched data within the system.

### Data visualization components
- **Graph.js**:
 A data visualization component using various types of graphs, allowing users to see trends and patterns in the collected data.

- **IconExplain.js**:
 This component imports icons for different data categories and displays a legend (or "bible menu") to help users understand the map's symbols and categories.

### Title and controls
- **MapHeader.js**:
 Displays the title of the map interface, including controls for selecting data, selecting a date range, and options for custom data retrieval.

### Data handling components
- **IntervalHandler.js**:
 Manages periodic checks for the SQS queue for relevant messages. It uses intervals to repeatedly call the 'listenSqs' function and handle the responses, ensuring real-time data updates.

- **Points.js**:
 Handles various API calls to fetch filtered information from the backend, based on user-selected criteria such as date ranges, categories, and geographies.

- **Sqs.js**:
 Monitor incoming data by listening to an SQS queue. It waits for notifications indicating that specific data is ready to be displayed, ensuring that the user receives the most up-to-date information.

## The beginning of the work
To get started with the GEOSHIELD faceplate:

1. Duplicate this repository.
2. Navigate to the `geoshieldmap` directory.
3. Install the dependencies by running `npm install`.
4. Start the development server with `npm start`.

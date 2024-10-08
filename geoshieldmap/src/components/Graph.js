import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Graph component for visualizing data
const Graph = ({ filteredData, selectedCategories, setGraphDataReceived }) => {
    // State to hold processed data for the chart
    const [data, setData] = useState([]);

    useEffect(() => {
        // Indicate that graph data has been received
        setGraphDataReceived(true);

        // Collect all unique dates from filteredData
        const allDates = new Set();
        filteredData.forEach(categoryDataObj => {
            Object.values(categoryDataObj).flat().forEach(entry => {
                allDates.add(entry.date);
            });
        });

        // Initialize data with all dates and 0 count for each category
        const initialData = Array.from(allDates).map(date => {
            const dataPoint = { date };
            selectedCategories.forEach(category => {
                dataPoint[category.value] = 0;
            });
            return dataPoint;
        });

        // Process the filteredData into a format suitable for the chart
        const data = selectedCategories.reduce((allData, category) => {
            const categoryName = category.value;
            const categoryDataObj = filteredData.find(data => data[categoryName]);
            const categoryData = categoryDataObj ? categoryDataObj[categoryName] : [];

            categoryData.forEach(entry => {
                const existingData = allData.find(data => data.date === entry.date);
                if (existingData) {
                    existingData[categoryName] = entry.count;
                }
            });
            return allData;
        }, initialData);

        // Update the state with processed data
        setData(data);
    }, [filteredData, selectedCategories, setGraphDataReceived]);

    // Predefined set of bright colors for the chart lines
    const brightColors = [
        "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FF8F33",
        "#33FFF3", "#B833FF", "#33FF8A", "#FF3333", "#FFEB33"
    ];

    return (
        <ResponsiveContainer width="100%" height={800}>
            <LineChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                style={{ backgroundColor: '#333' }} // Set background color to dark
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" /> {/* Grid lines */}
                <XAxis dataKey="date" stroke="#ccc" /> {/* X-axis (dates) */}
                <YAxis 
                    stroke="#ccc" 
                    label={{ 
                        value: 'Amount of Event', 
                        angle: -90, 
                        position: 'insideLeft', 
                        fill: '#ccc' 
                    }} 
                /> {/* Y-axis with label */}
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#555', 
                        borderColor: '#777', 
                        color: '#fff' 
                    }} 
                /> {/* Tooltip for data points */}
                <Legend wrapperStyle={{ color: '#fff' }} /> {/* Legend for categories */}
                {/* Generate a Line for each selected category */}
                {selectedCategories.map((category, index) => (
                    <Line
                        key={index}
                        type="monotone"
                        dataKey={category.value}
                        name={category.label}
                        stroke={brightColors[index % brightColors.length]} // Cycle through bright colors
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default Graph;
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Graph = ({ filteredData, selectedCategories, setGraphDataReceived }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
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

        // Flatten the filteredData into an array of objects with date and count for each category
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

        setData(data);
    }, [filteredData, selectedCategories, setGraphDataReceived]);

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
                <CartesianGrid strokeDasharray="3 3" stroke="#444" /> {/* Change grid color */}
                <XAxis dataKey="date" stroke="#ccc" /> {/* Change X-axis color */}
                <YAxis stroke="#ccc" label={{ value: 'Amount of Event', angle: -90, position: 'insideLeft', fill: '#ccc' }} /> {/* Change Y-axis color and add label */}
                <Tooltip contentStyle={{ backgroundColor: '#555', borderColor: '#777', color: '#fff' }} /> {/* Change tooltip background and text color */}
                <Legend wrapperStyle={{ color: '#fff' }} /> {/* Change legend text color */}
                {selectedCategories.map((category, index) => {
                    const brightColors = [
                        "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FF8F33",
                        "#33FFF3", "#B833FF", "#33FF8A", "#FF3333", "#FFEB33"
                    ]; // Predefined set of bright colors
                    return (
                        <Line
                            key={index}
                            type="monotone"
                            dataKey={category.value}
                            name={category.label}
                            stroke={brightColors[index % brightColors.length]} // Use bright colors
                        />
                    );
                })}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default Graph;

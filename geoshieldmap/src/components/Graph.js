import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Graph = ({ filteredData, selectedCategories, selectedLocation }) => {

    // Flatten the filteredData into an array of objects with date and count for each category
    const data = selectedCategories.reduce((allData, category) => {
        const categoryName = category.value;
        // Find the category data in filteredData array
        const categoryDataObj = filteredData.find(data => data[categoryName]);
        const categoryData = categoryDataObj ? categoryDataObj[categoryName] : [];
        
        categoryData.forEach(entry => {
            const existingData = allData.find(data => data.date === entry.date);
            if (existingData) {
                existingData[categoryName] = entry.count;
            } else {
                const newData = { date: entry.date };
                newData[categoryName] = entry.count;
                allData.push(newData);
            }
        });
        return allData;
    }, []);

    return (
        <div>
            <h2>Data for {selectedLocation} by categories: {selectedCategories.map(category => category.label).join(', ')}</h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedCategories.map((category, index) => (
                        <Line
                            key={index}
                            type="monotone"
                            dataKey={category.value}
                            name={category.label}
                            stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`} // Generate random color
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Graph;

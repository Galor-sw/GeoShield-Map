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
                    <YAxis stroke="#ccc" /> {/* Change Y-axis color */}
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

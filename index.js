const express = require('express');
const path = require('path');
const cors = require('cors');

// Import countries data
const countries = require('./api/countries');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
app.get('/api', (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Extract query parameters
    const { name, code, search, limit, page } = req.query;
    let result = [...countries];

    // Filter by country name (exact match)
    if (name) {
        result = result.filter(country => 
            country.name.toLowerCase() === name.toLowerCase()
        );
    }

    // Filter by country code
    if (code) {
        result = result.filter(country => 
            country.code.toLowerCase() === code.toLowerCase()
        );
    }

    // Search by name (partial match)
    if (search) {
        result = result.filter(country => 
            country.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    // Pagination
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || result.length;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedResult = result.slice(startIndex, endIndex);

    // Return response
    return res.status(200).json({
        success: true,
        count: paginatedResult.length,
        total: result.length,
        page: pageNumber,
        pages: Math.ceil(result.length / pageSize),
        data: paginatedResult
    });
});

// Specific country by code
app.get('/api/:code', (req, res) => {
    const countryCode = req.params.code.toUpperCase();
    const country = countries.find(c => c.code === countryCode);
    
    if (country) {
        res.json({
            success: true,
            data: country
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Country not found'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'Country Finder API is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Website: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
});

module.exports = app;

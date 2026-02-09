const countriesData = require('./countries');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed. Only GET requests are accepted.' 
    });
  }

  // Extract query parameters
  const { name, code, search, limit, page } = req.query;
  let result = [...countriesData];

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
};

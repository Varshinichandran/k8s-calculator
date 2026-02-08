const express = require('express');
const client = require('prom-client');

const app = express();
const register = new client.Registry();

// Default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

// Custom metric
const calculatorRequests = new client.Counter({
  name: 'calculator_requests_total',
  help: 'Total requests to calculator API',
});
register.registerMetric(calculatorRequests);

// Your existing calculator route
app.get('/calculate', (req, res) => {
  calculatorRequests.inc(); // Increment counter
  // Your calculation logic here
  res.send('Calculation done');
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => console.log('Server running on port 3000'));

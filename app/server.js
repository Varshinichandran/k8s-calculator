const express = require("express");
const path = require("path");
const client = require("prom-client");

const app = express();
const PORT = 4000; // Use 4000 to avoid Grafana port conflict

// -------------------------
// Prometheus Metrics Setup
// -------------------------
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const calculatorRequests = new client.Counter({
  name: "calculator_requests_total",
  help: "Total requests to calculator API",
});
register.registerMetric(calculatorRequests);

// -------------------------
// Serve Frontend HTML
// -------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "calculator.html"));
});

// -------------------------
// Calculator API
// -------------------------
app.get("/calculate", (req, res) => {
  calculatorRequests.inc(); // increment metric

  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  let op = req.query.op;

  // Validate query parameters
  if (isNaN(num1) || isNaN(num2) || !op) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid parameters: num1, num2, op",
    });
  }

  // Decode operator if URL-encoded
  op = decodeURIComponent(op);

  let result;

  switch (op) {
    case "+":
      result = num1 + num2;
      break;
    case "-":
      result = num1 - num2;
      break;
    case "*":
      result = num1 * num2;
      break;
    case "/":
      if (num2 === 0) {
        return res.status(400).json({ success: false, message: "Division by zero not allowed" });
      }
      result = num1 / num2;
      break;
    default:
      return res.status(400).json({ success: false, message: "Invalid operation. Allowed: +, -, *, /" });
  }

  // Return professional JSON response
  res.status(200).json({
    success: true,
    num1,
    num2,
    operation: op,
    result,
  });
});

// -------------------------
// Prometheus Metrics Endpoint
// -------------------------
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

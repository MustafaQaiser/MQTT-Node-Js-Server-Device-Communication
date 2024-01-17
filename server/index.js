const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
app.use(bodyParser.json());
// Connect to MongoDB (Assuming you have a 'Device' model/schema)
mongoose.connect('mongodb+srv://mustafa:mustafa@cluster0.3rsyqou.mongodb.net/');

const Device = mongoose.model('Device', {
  imei: String,
  serialNo: String,
});

// MQTT Broker (for simplicity, you can use a real MQTT broker in production)
const mqttBroker = mqtt.connect('mqtt://localhost:1883'); // or use the actual address of your MQTT broker


mqttBroker.on('connect', () => {
  console.log('MQTT Broker connected');
});

// MQTT Subscription for Device Registration
mqttBroker.subscribe('device/register');

mqttBroker.on('message', (topic, message) => {
  if (topic === 'device/register') {
    handleDeviceRegistration(JSON.parse(message));
  }
});

// Function to Handle Device Registration
async function handleDeviceRegistration(deviceInfo) {
  const { imei, serialNo } = deviceInfo;

  // Check if the device is already registered
  const existingDevice = await Device.findOne({ imei });

  if (existingDevice) {
    console.log(`Device with IMEI ${imei} is connected.`);
  } else {
    // Register the new device
    const newDevice = new Device({ imei, serialNo });
    await newDevice.save();
    console.log(`Device with IMEI ${imei} is registered.`);
  }
}

// HTTP API for Factory Reset
app.post('/factory-reset', (req, res) => {
  const { imei } = req.body;

  // Send factory reset message to the specified device
  mqttBroker.publish(`device/${imei}/factory-reset`, JSON.stringify({ message: 'Factory reset requested' }));

  res.json({ success: true, message: 'Factory reset request sent' });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

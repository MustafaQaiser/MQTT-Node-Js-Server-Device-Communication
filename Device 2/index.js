const mqtt = require('mqtt');

const deviceInfo = {
  imei: '123456789',
  serialNo: 'ABCDE12345',
};

const mqttBroker = mqtt.connect('mqtt://localhost:1883'); // or use the actual address of your MQTT broker


mqttBroker.on('connect', () => {
  console.log('Device connected to MQTT Broker');

  // Send registration message to the server
  mqttBroker.publish('device/register', JSON.stringify(deviceInfo));
});

// MQTT Subscription for Factory Reset
mqttBroker.subscribe(`device/${deviceInfo.imei}/factory-reset`);

mqttBroker.on('message', (topic, message) => {
  if (topic === `device/${deviceInfo.imei}/factory-reset`) {
    console.log('Received factory reset message:', JSON.parse(message));
    // Implement factory reset logic here
  }
});

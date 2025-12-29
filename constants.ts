export const ESP32_CODE_SNIPPET = `
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* firebase_url = "https://YOUR_PROJECT.firebaseio.com/bins/bin_01/readings.json";

// HC-SR04 Pins
const int trigPin = 5;
const int echoPin = 18;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
}

void loop() {
  // 1. Measure Distance
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.034 / 2;

  // 2. Prepare Payload
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(firebase_url);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["distance"] = distanceCm;
    doc["timestamp"] = millis(); // Replace with NTP time in production

    String requestBody;
    serializeJson(doc, requestBody);

    // 3. Send to Firebase
    int httpResponseCode = http.POST(requestBody);
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    
    http.end();
  }

  delay(60000); // Send every minute
}
`;

export const FIREBASE_RULES_SNIPPET = `
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "bins": {
      "$binId": {
        // Allow reading/writing bin metadata like location
        ".read": true, 
        ".write": "auth != null",
        "location": {
           ".validate": "newData.isString() && newData.val().length < 50"
        },
        "readings": {
           // Sensor data append-only usually
           ".write": true 
        }
      }
    }
  }
}
`;

export const MOCK_BINS_DATA = [
  {
    id: 'bin_001',
    name: 'Kitchen Main',
    location: 'Building A, Floor 1',
    heightCm: 100,
    currentDistanceCm: 25,
    lastUpdated: new Date().toISOString(),
    status: 'active',
    history: []
  },
  {
    id: 'bin_002',
    name: 'Office Paper',
    location: 'Building A, Floor 2',
    heightCm: 80,
    currentDistanceCm: 70,
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    status: 'active',
    history: []
  },
  {
    id: 'bin_003',
    name: 'Cafeteria Organic',
    location: 'Building B, Cafeteria',
    heightCm: 120,
    currentDistanceCm: 110,
    lastUpdated: new Date(Date.now() - 15000).toISOString(),
    status: 'active',
    history: []
  }
];

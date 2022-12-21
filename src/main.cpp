#include <Arduino.h>
#include <M5StickC.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>

#define LED_PIN 10

// Replace with your network credentials
#define SSID "PC35"
#define PSWD "aiaioeax"

bool ledState = 0;

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

void notifyClients() {
  ws.textAll(String(ledState));
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;
    if (strcmp((char*)data, "toggle") == 0) {
      ledState = !ledState;
      notifyClients();
    }
  }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type,
             void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
      client->text(String(ledState));
      break;
    case WS_EVT_DISCONNECT:
      Serial.printf("WebSocket client #%u disconnected\n", client->id());
      break;
    case WS_EVT_DATA:
      handleWebSocketMessage(arg, data, len);
      break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
      break;
  }
}

void setup(){
  pinMode(LED_PIN, OUTPUT);
  
  // Serial port for debugging purposes
  M5.begin();
  M5.Lcd.setRotation(1);
  //M5.Lcd.setTextSize(2);

  SPIFFS.begin();

  // Connect to Wi-Fi
  WiFi.begin(SSID, PSWD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }

  // Print ESP Local IP Address
  Serial.println(WiFi.localIP());
  M5.Lcd.println(WiFi.localIP());

  server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html");

  server.onNotFound([](AsyncWebServerRequest *request) {
    if (request->method() == HTTP_OPTIONS)
    {
      request->send(200);
    }
    else
    {
      Serial.println("Not found");
      request->send(404, "Not found");
    }
  });

  ws.onEvent(onEvent);
  server.addHandler(&ws);

  server.begin();
}

void loop() {
  ws.cleanupClients();
  digitalWrite(LED_PIN, !ledState);
}
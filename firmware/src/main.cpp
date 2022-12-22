#include <Arduino.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <M5StickC.h>
#include <SPIFFS.h>
#include <WiFi.h>

#include "wifi_config.h"

#define LED_PIN 10

const char *stateNames[] = {"OFF", "ON"};
bool ledState = 0;
bool notifyClientsRequested = false;

#define DISPLAY_TIMEOUT 10000
bool displayState = 1;
bool turnOnDisplayRequested = false;
uint32_t displayTime = 1;

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

void toggleLed() {
  ledState = !ledState;
  digitalWrite(LED_PIN, !ledState);
  notifyClientsRequested = true;
}

void turnOnDisplay() {
  M5.Axp.SetLDO2(true);
  M5.Axp.SetLDO3(true);
  displayState = 1;
}

void turnOffDisplay() {
  M5.Axp.SetLDO2(false);
  M5.Axp.SetLDO3(false);
  displayState = 0;
}

void notifyClients() {
  ws.textAll(stateNames[ledState]);
}

void IRAM_ATTR btnPress() {
  turnOnDisplayRequested = true;
  if (displayState) {
    toggleLed();
  }
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo *)arg;
  if (info->final && info->index == 0 && info->len == len &&
      info->opcode == WS_TEXT) {
    data[len] = 0;
    if (strcmp((char *)data, "toggle") == 0) {
      toggleLed();
      notifyClients();
    }
  }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
      client->text(stateNames[ledState]);
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

void setup() {
  M5.begin();

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);
  analogSetAttenuation(ADC_0db);
  attachInterrupt(BUTTON_A_PIN, btnPress, FALLING);

  SPIFFS.begin();

  M5.Lcd.setRotation(1);
  M5.Lcd.println("Connecting to WiFi..");
  M5.Lcd.println(WIFI_SSID);

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }

  // Print ESP Local IP Address
  Serial.println(WiFi.localIP());
  M5.Lcd.println(WiFi.localIP());

  server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html");

  server.onNotFound([](AsyncWebServerRequest *request) {
    if (request->method() == HTTP_OPTIONS) {
      request->send(200);
    } else {
      Serial.println("Not found");
      request->send(404, "Not found");
    }
  });

  ws.onEvent(onEvent);
  server.addHandler(&ws);

  server.begin();
  M5.Lcd.setTextSize(4);
}

void loop() {
  if (turnOnDisplayRequested) {
    displayTime = millis();
    turnOnDisplayRequested = false;
    turnOnDisplay();
  } else if (displayState == 1 && millis() - displayTime > DISPLAY_TIMEOUT) {
    turnOffDisplay();
  }
  if (notifyClientsRequested) {
    notifyClients();
    notifyClientsRequested = false;
  }
  double temperature = analogReadMilliVolts(36) / 10.0;
  // Serial.printf("Temperature: %.1f C\n", temperature);
  if (displayState) {
    M5.Lcd.setCursor(0, 40);
    M5.Lcd.printf("%.1f C", temperature);
  }
  ws.cleanupClients();
  ws.textAll(String(temperature));
  delay(500);
}
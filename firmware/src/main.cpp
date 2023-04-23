#include <Arduino.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <M5StickC.h>
#include <Preferences.h>
#include <SPIFFS.h>
#include <WiFi.h>
#include <cJSON.h>

#include "M5Battery.h"

#define LED_PIN 10

bool ledState = false;
#define DISPLAY_TIMEOUT 10000
bool displayState = true;
bool turnOnDisplayRequested = false;
uint32_t displayTime = 1;

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncEventSource sse("/events");
Preferences NVS;

void toggleLed() {
  ledState = !ledState;
  digitalWrite(LED_PIN, !ledState);
}

void setDisplay(bool state) {
  M5.Axp.SetLDO2(state);
  M5.Axp.SetLDO3(state);
  displayState = state;
}

void IRAM_ATTR btnPress() {
  turnOnDisplayRequested = true;
  if (displayState) {
    toggleLed();
  }
}

char *getStatusJsonString(double temperature) {
  cJSON *root = cJSON_CreateObject();
  String temp = String(temperature, 1);
  cJSON_AddBoolToObject(root, "led", ledState);
  cJSON_AddRawToObject(root, "temp", temp.c_str());
  cJSON_AddNumberToObject(root, "battery", (int)getM5BatteryLevel());
  cJSON_AddBoolToObject(root, "charging", isM5BatteryCharging());
  char *json = cJSON_PrintUnformatted(root);
  cJSON_Delete(root);
  return json;
}

void setup() {
  delay(1000);
  M5.begin();

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);
  analogSetAttenuation(ADC_0db);
  attachInterrupt(BUTTON_A_PIN, btnPress, FALLING);

  M5.Lcd.setRotation(1);
  SPIFFS.begin();

  NVS.begin("wifi", false);
  if (NVS.isKey("ssid")) {
    Serial.println("WiFi credentials found");
    WiFi.mode(WIFI_STA);
    String sta_ssid = NVS.getString("ssid");
    String sta_password = NVS.getString("password");
    WiFi.begin(sta_ssid.c_str(), sta_password.c_str());
    M5.Lcd.println("Connecting to WiFi..");
    Serial.println("Connecting to WiFi..");
    M5.Lcd.println(sta_ssid);
    WiFi.waitForConnectResult(5000);
  }
  NVS.end();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi AP mode");
    WiFi.mode(WIFI_AP);
    const char *ap_ssid = "M5StickC-Thermostat";
    WiFi.softAP(ap_ssid, "12345678");
    M5.Lcd.println("WiFi AP started");
    M5.Lcd.println(ap_ssid);
  }

  // Print ESP Local IP Address
  Serial.println(WiFi.localIP().toString() + " - " + WiFi.softAPIP().toString());
  M5.Lcd.println(WiFi.localIP().toString() + " - " + WiFi.softAPIP().toString());

  server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html");

  server.onNotFound([](AsyncWebServerRequest *request) {
    if (request->method() == HTTP_OPTIONS) {
      request->send(200);
    } else {
      Serial.println("Not found");
      request->send(404, "Not found");
    }
  });

  server.on(
      "/wifi", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL,
      [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
        cJSON *json_data = cJSON_ParseWithLength((const char *)data, len);
        if (json_data == NULL) {
          request->send(400, "text/plain", "Bad Request");
          return;
        }
        cJSON *ssid = cJSON_GetObjectItem(json_data, "ssid");
        cJSON *password = cJSON_GetObjectItem(json_data, "password");
        if (ssid == NULL || password == NULL) {
          request->send(400, "text/plain", "Bad Request");
          return;
        }
        NVS.begin("wifi", false);
        NVS.putString("ssid", ssid->valuestring);
        NVS.putString("password", password->valuestring);
        NVS.end();
        request->send(200, "text/plain", "OK");
      });

  server.on("/reboot", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "text/plain", "OK");
    delay(1000);
    ESP.restart();
  });

  server.on("/toggle", HTTP_GET, [](AsyncWebServerRequest *request) {
    toggleLed();
    request->send(200, "text/plain", "OK");
  });

  sse.onConnect([](AsyncEventSourceClient *client) {
    Serial.println("Client connected to SSE, IP: " + client->client()->remoteIP().toString());
    if (client->lastId()) {
      Serial.printf("Client reconnected! Last message ID that it got is: %u\n", client->lastId());
    }
  });

  server.addHandler(&sse);

  server.begin();
  M5.Lcd.setTextSize(4);
}

void loop() {
  if (turnOnDisplayRequested) {
    displayTime = millis();
    turnOnDisplayRequested = false;
    setDisplay(true);
  } else if (displayState && millis() - displayTime > DISPLAY_TIMEOUT) {
    setDisplay(false);
  }
  if (displayState || sse.count() > 0) {
    double temperature = analogReadMilliVolts(36) / 10.0;
    // Serial.printf("Temperature: %.1f C\n", temperature);
    if (displayState) {
      M5.Lcd.setCursor(0, 40);
      M5.Lcd.printf("%.1f C", temperature);
    }
    if (sse.count() > 0) {
      char *json = getStatusJsonString(temperature);
      sse.send(json, "status", millis());
      free(json);
    }
  }
  delay(500);
}
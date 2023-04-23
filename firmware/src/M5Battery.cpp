#include "M5Battery.h"

#include "M5StickC.h"

static float VOLTAGE_MAP[] = {3.20, 3.27, 3.61, 3.69, 3.71, 3.73, 3.75, 3.77, 3.79, 3.80, 3.82, 3.84, 3.85, 3.87, 3.91, 3.95, 3.98, 4.02, 4.08, 4.11, 4.13, 4.15};
#define VOLTAGE_MAP_SIZE sizeof(VOLTAGE_MAP) / sizeof(VOLTAGE_MAP[0])  // number of values in the voltageMap array

float getM5BatteryLevel() {
  float voltage = M5.Axp.GetBatVoltage();
  // Find the range that the input voltage falls into
  int i;
  for (i = 0; i < VOLTAGE_MAP_SIZE; i++) {
    if (voltage < VOLTAGE_MAP[i]) break;
  }

  // Interpolate the percentage based on the voltage range
  if (i == 0) return 0;                   // handle the case where the input voltage is less than the lowest value in the VOLTAGE_MAP array
  if (i == VOLTAGE_MAP_SIZE) return 100;  // handle the case where the input voltage is greater than the highest value in the VOLTAGE_MAP array

  return 100.0 * (i - 1 + (voltage - VOLTAGE_MAP[i - 1]) / (VOLTAGE_MAP[i] - VOLTAGE_MAP[i - 1])) / (VOLTAGE_MAP_SIZE - 1);
}

bool isM5BatteryCharging() {
  return M5.Axp.GetVBusVoltage() > 4.5;
}
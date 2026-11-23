#include <Arduino.h>
#include <NimBLEDevice.h>

// ---------- Pins (ESP32 DevKit, 30-pin) ----------
constexpr uint8_t PIN_PANIC  = 27;  // push button to GND, INPUT_PULLUP
constexpr uint8_t PIN_BUZZER = 25;  // -> 1k -> NPN base
constexpr uint8_t PIN_LED    = 26;  // -> 330R -> LED -> GND
constexpr uint8_t PIN_VBAT   = 34;  // ADC1, middle of 2 x 100k divider
constexpr uint8_t PIN_CHRG   = 32;  // TP4056 CHRG (LOW = charging), optional

// ---------- UUIDs (generated for this project) ----------
#define SVC_UUID    "a7c30001-8e6f-42ea-8292-1758b7090812"
#define PANIC_UUID  "a7c30002-8e6f-42ea-8292-1758b7090812"
#define BUZZER_UUID "a7c30003-8e6f-42ea-8292-1758b7090812"
#define STATUS_UUID "a7c30004-8e6f-42ea-8292-1758b7090812"

// ---------- Behaviour constants ----------
constexpr uint32_t LONG_PRESS_MS    = 1500;   // hold time for a panic
constexpr uint32_t PENDING_PANIC_MS = 60000;  // deliver a panic made while offline
constexpr uint32_t BATTERY_EVERY_MS = 30000;
constexpr uint8_t  LOW_BATTERY_PCT  = 20;
constexpr uint8_t  FW_MAJOR = 0, FW_MINOR = 1;

static NimBLEServer*         server;
static NimBLECharacteristic* chPanic;
static NimBLECharacteristic* chBuzzer;
static NimBLECharacteristic* chStatus;
static NimBLECharacteristic* chBatt;

static bool     buzzerActive = false;
static uint32_t buzzerStopAt = 0;
static uint8_t  panicCounter = 0;
static uint32_t pendingPanicUntil = 0;  // 0 = nothing pending
static uint32_t ledFastUntil = 0;
static bool     lowBattery = false;
static uint8_t  lastBattPct = 255;

// ---------- Battery ----------
static const float   CURVE_V[] = {3.30, 3.50, 3.60, 3.70, 3.80, 3.90, 4.00, 4.10, 4.20};
static const uint8_t CURVE_P[] = {   0,    5,   15,   35,   55,   70,   82,   92,  100};

static float readVbat() {                      // volts at the cell
  uint32_t mv = 0;
  for (int i = 0; i < 16; i++) { mv += analogReadMilliVolts(PIN_VBAT); delay(2); }
  return (mv / 16.0f) * 2.0f / 1000.0f;        // divider ratio 2:1
}

static uint8_t battPercent(float v) {          // typical Li-Po curve, calibrate on your cell
  if (v <= CURVE_V[0]) return 0;
  for (int i = 1; i < 9; i++) {
    if (v <= CURVE_V[i]) {
      float t = (v - CURVE_V[i - 1]) / (CURVE_V[i] - CURVE_V[i - 1]);
      return (uint8_t)(CURVE_P[i - 1] + t * (CURVE_P[i] - CURVE_P[i - 1]));
    }
  }
  return 100;
}

static void updateBattery() {
  static uint32_t next = 0;
  if ((int32_t)(millis() - next) < 0) return;
  next = millis() + BATTERY_EVERY_MS;

  uint8_t pct = battPercent(readVbat());
  lowBattery = pct <= LOW_BATTERY_PCT;
  bool charging = digitalRead(PIN_CHRG) == LOW;
  uint8_t st[3] = {(uint8_t)((charging ? 1 : 0) | (lowBattery ? 2 : 0)), FW_MAJOR, FW_MINOR};
  chStatus->setValue(st, 3);
  if (pct != lastBattPct) {
    lastBattPct = pct;
    chBatt->setValue(&pct, 1);
    if (server->getConnectedCount() > 0) { chBatt->notify(); chStatus->notify(); }
  }
}

// ---------- Panic ----------
static void sendPanic() {
  panicCounter++;
  uint8_t payload[2] = {1, panicCounter};      // state, counter
  chPanic->setValue(payload, 2);
  if (server->getConnectedCount() > 0) chPanic->notify();
  else pendingPanicUntil = millis() + PENDING_PANIC_MS;
  ledFastUntil = millis() + 1500;              // local feedback for the child
}

static void updatePanicButton() {
  static uint32_t downSince = 0, upSince = 0;
  static bool pressed = false, fired = false;
  uint32_t now = millis();
  if (digitalRead(PIN_PANIC) == LOW) {
    upSince = 0;
    if (!pressed) { pressed = true; fired = false; downSince = now; }
    else if (!fired && now - downSince >= LONG_PRESS_MS) { fired = true; sendPanic(); }
  } else if (pressed) {
    if (upSince == 0) upSince = now;
    if (now - upSince >= 30) pressed = false;  // released for 30 ms = real release
  }
}

// ---------- Buzzer and LED ----------
static void updateBuzzer() {
  if (buzzerActive && (int32_t)(millis() - buzzerStopAt) >= 0) buzzerActive = false;
  bool on = buzzerActive && ((millis() / 200) % 2 == 0);   // 200 ms on, 200 ms off
  digitalWrite(PIN_BUZZER, on ? HIGH : LOW);
}

static void updateLed() {
  uint32_t t = millis();
  bool on = false;
  if ((int32_t)(ledFastUntil - t) > 0) on = (t / 100) % 2 == 0;             // panic sent
  else if (lowBattery) { uint32_t p = t % 10000; on = p < 100 || (p > 300 && p < 400); }
  else if (server->getConnectedCount() == 0) on = (t % 2000) < 60;          // searching
  digitalWrite(PIN_LED, on ? HIGH : LOW);
}

// ---------- BLE callbacks ----------
class ServerCb : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer* s, NimBLEConnInfo& info) override {
    // 30-60 ms interval, no latency, 4 s supervision timeout (starting values)
    s->updateConnParams(info.getConnHandle(), 24, 48, 0, 400);
  }
  void onDisconnect(NimBLEServer* s, NimBLEConnInfo& info, int reason) override {
    NimBLEDevice::startAdvertising();
  }
  void onAuthenticationComplete(NimBLEConnInfo& info) override {
    if (!info.isEncrypted()) NimBLEDevice::getServer()->disconnect(info.getConnHandle());
  }
} serverCb;

class BuzzerCb : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic* c, NimBLEConnInfo& info) override {
    NimBLEAttValue v = c->getValue();
    if (v.size() == 0) return;
    const uint8_t* d = v.data();
    if (d[0] == 1) {
      uint8_t secs = (v.size() > 1) ? d[1] : 30;
      if (secs < 1) secs = 1;
      if (secs > 120) secs = 120;              // firmware-side safety limit
      buzzerStopAt = millis() + (uint32_t)secs * 1000UL;
      buzzerActive = true;
    } else {
      buzzerActive = false;
    }
  }
} buzzerCb;

class PanicCb : public NimBLECharacteristicCallbacks {
  void onSubscribe(NimBLECharacteristic* c, NimBLEConnInfo& info, uint16_t subValue) override {
    // A panic made while no phone was connected is sent as soon as the phone subscribes.
    if ((subValue & 1) && pendingPanicUntil != 0 &&
        (int32_t)(pendingPanicUntil - millis()) > 0) {
      c->notify();
    }
    pendingPanicUntil = 0;
  }
} panicCb;

// ---------- setup / loop ----------
void setup() {
  Serial.begin(115200);
  pinMode(PIN_PANIC, INPUT_PULLUP);
  pinMode(PIN_CHRG, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  analogSetPinAttenuation(PIN_VBAT, ADC_11db);

  NimBLEDevice::init("ST");
  // bonding = yes, MITM = no (the wearable has no display or keypad), LE Secure Connections = yes
  NimBLEDevice::setSecurityAuth(true, false, true);

  server = NimBLEDevice::createServer();
  server->setCallbacks(&serverCb);

  NimBLEService* svc = server->createService(SVC_UUID);
  chPanic  = svc->createCharacteristic(PANIC_UUID,
               NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY);
  chBuzzer = svc->createCharacteristic(BUZZER_UUID,
               NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::WRITE_ENC);  // bonded phones only
  chStatus = svc->createCharacteristic(STATUS_UUID,
               NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY);
  chPanic->setCallbacks(&panicCb);
  chBuzzer->setCallbacks(&buzzerCb);
  uint8_t p0[2] = {0, 0};
  chPanic->setValue(p0, 2);

  NimBLEService* bat = server->createService("180F");                 // standard Battery Service
  chBatt = bat->createCharacteristic("2A19",
             NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY);

  lastBattPct = battPercent(readVbat());
  chBatt->setValue(&lastBattPct, 1);
  lowBattery = lastBattPct <= LOW_BATTERY_PCT;
  uint8_t st[3] = {(uint8_t)(lowBattery ? 2 : 0), FW_MAJOR, FW_MINOR};
  chStatus->setValue(st, 3);

  // Name = "ST-" + last 4 hex digits of the MAC. Kept short: a 128-bit UUID already uses
  // 18 of the 31 advertising bytes.
  std::string mac = NimBLEDevice::getAddress().toString();   // "aa:bb:cc:dd:ee:ff"
  std::string name = "ST-" + mac.substr(12, 2) + mac.substr(15, 2);

  NimBLEAdvertising* adv = NimBLEDevice::getAdvertising();
  adv->setName(name.c_str());
  adv->addServiceUUID(svc->getUUID());
  adv->enableScanResponse(true);
  adv->start();
  Serial.printf("Advertising as %s\n", name.c_str());
}

void loop() {
  updatePanicButton();
  updateBuzzer();
  updateLed();
  updateBattery();
  delay(5);
}

const int ledPins[] = {9, 10, 11, 12, 13};
const int LED_COUNT = sizeof(ledPins) / sizeof(ledPins[0]);

void allOff() {
  for (int i = 0; i < LED_COUNT; i++) {
    digitalWrite(ledPins[i], LOW);
  }
}

void setup() {
  Serial.begin(9600);

  for (int i = 0; i < LED_COUNT; i++) {
    pinMode(ledPins[i], OUTPUT);
  }
  allOff();

  randomSeed(analogRead(A0));  

  Serial.println("READY");
  Serial.println("Send START to light a random LED.");
}

void loop() {
  if (!Serial.available()) return;

  String cmd = Serial.readStringUntil('\n');
  cmd.trim();

  if (cmd == "ALL_OFF") {
    allOff();
    Serial.println("OK");
    return;
  }

  if (cmd.startsWith("LED:")) {
    // exempel: LED:3;ON
    int colon = cmd.indexOf(':');
    int semi = cmd.indexOf(';');
    if (colon == -1 || semi == -1) {
      Serial.println("ERR");
      return;
    }

    int idx = cmd.substring(colon + 1, semi).toInt();
    String action = cmd.substring(semi + 1);

    if (idx < 0 || idx >= LED_COUNT) {
      Serial.println("ERR_IDX");
      return;
    }

    if (action == "ON") {
      digitalWrite(ledPins[idx], HIGH);
      Serial.print("ON=");
      Serial.println(idx);
    } else if (action == "OFF") {
      digitalWrite(ledPins[idx], LOW);
      Serial.print("OFF=");
      Serial.println(idx);
    } else {
      Serial.println("ERR_ACT");
    }
    return;
  }

  Serial.println("UNKNOWN");
}

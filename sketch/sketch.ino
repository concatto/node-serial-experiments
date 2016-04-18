#define DONE 0

void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() >= 3) {
    int command = Serial.read();
    int pin = Serial.read();
    int value = Serial.read();
    if (command == 0) {
      configure(pin, value);
    } else if (command == 1) {
      control(pin, value);
    } else if (command == 2) {
      wait(value);
    }

    Serial.write(DONE);
  }
}

void configure(int pin, int value) {
  pinMode(pin, value == 0 ? INPUT : OUTPUT);
}

void wait(int value) {
  delay(value * 5);
}

void control(int pin, int value) {
  if (value == 0 || value == 255) {
    digitalWrite(pin, value == 255 ? HIGH : LOW);
  } else {
    analogWrite(pin, value);
  }
}

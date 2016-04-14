void setup() {
  Serial.begin(9600);
}
  
void loop() {
  if (Serial.available() > 1) {
    int command = Serial.read();
    int value = Serial.read();
    if (command == 0) {
      configure(command, value);
    } else if (command == 1) {
      wait(value);
    } else if (command <= 13) {
      controlSpecific(command, value);
    }
  }
}

void configure(int pin, int value) {
  pinMode(pin, value == 0 ? INPUT : OUTPUT);
}

void wait(int value) {
  delay(value * 5);
}

void controlSpecific(int pin, int value) {
  if (value == 0 || value == 255) {
    digitalWrite(pin, value == 255 ? HIGH : LOW);
  } else {
    analogWrite(pin, value);
  }
}

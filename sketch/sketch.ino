#define DONE 0

void setup() {
    Serial.begin(9600);
}

void loop() {
    if (Serial.available() >= 3) {
        int operation = Serial.read();
        int first = Serial.read();
        int second = Serial.read();
        if (operation == 1) {
            configure(first, second);
        } else if (operation == 2) {
            control(first, second);
        } else if (operation == 3) {
            wait(first, second);
        }

        Serial.write(DONE);
    }
}

void configure(int pin, int value) {
    pinMode(pin, value == 0 ? INPUT : OUTPUT);
}

void wait(int high, int low) {
    int value = (high << 8) | (low & 0xFF);
    delay(value);
}

void control(int pin, int value) {
    if (value == 0 || value == 255) {
        digitalWrite(pin, value == 255 ? HIGH : LOW);
    } else {
        analogWrite(pin, value);
    }
}

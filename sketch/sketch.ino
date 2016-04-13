void setup() {
  Serial.begin(9600);
  pinMode(3, OUTPUT);
  analogWrite(3, 0);
}
  
void loop() {
  if (Serial.available() > 0) {
    int value = Serial.read();
    Serial.println(value);
    if (value >= 0 && value <= 255) {

      analogWrite(3, value);
    }
  }
}

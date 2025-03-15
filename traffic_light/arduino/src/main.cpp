/*
만들어야 할 기능
  
[기본]
1. 빨간색(2초) -> 노란색(0.5초) -> 초록색(2초) (O)
2. 가변저항을 조절하면 전체 LED의 밝기가 조절됨 ( )
3. stop_button을 누르면 빨간색만 켜짐 ( )
4. onoff_button을 누르면 모든 LED가 꺼지고 켜짐 ( )
5. blinking_button을 누르면 모든 LED가 0.5초 간격으로 깜박임 ( )

[심화 + p5.js]
1. 가변저항의 값을 실시간으로 받아와서 전체 LED의 밝기 수준을 p5.js에 표현함 ( )
2. 각 LED의 슬라이더를 생성하여 LED가 깜빡이는 주기를 조절함 ( )
3. 각 LED가 켜졌는지 꺼졌는지 나타내는 원형 세개를 만듦 ( )
*/

// &&&&&&&&&&&&&&&&&&&&&&&&&&& VERSION 1 &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

#if 1

#include <Arduino.h>
#include <TaskScheduler.h>
#include <PinChangeInterrupt.h>

//pin definition
#define LED_R 11
#define LED_Y 10
#define LED_G 9
#define stop_button 2
#define onoff_button 3
#define blinking_button 4
#define potPin A0 // 가변저항 핀

//function definition
void Enable_R();
void Enable_Y();
void Enable_G();
void Enable_GB();
void Toggle_GB();

void stop_pressed();
void stop_func();
void onoff_pressed();
void onoff_func();
void blinking_pressed();
void blinking_func();
void CheckSerialInput();
void lightIndicator();

//global variables
int period_R = 2000; // 빨간색 LED 주기
int period_Y = 500; // 노란색 LED 주기
int period_G = 2000; // 초록색 LED 주기
int period_GB = 1000; // 초록색 깜박임 주기
int blinking_GB = 7; // 초록색 깜박임 횟수
bool redToGreen = true; // 빨간색 -> 초록색으로 넘어가는지 확인하는 변수
int lightLevel = 0; // 가변저항 값 (0 ~ 255)

//Scheduler object
Scheduler ts;
Task t_R(period_R, TASK_ONCE, &Enable_R, &ts, false);// 빨간색 LED task
Task t_Y(period_Y, TASK_ONCE, &Enable_Y, &ts, false);// 노란색 LED task
Task t_G(period_G, TASK_ONCE, &Enable_G, &ts, false);// 초록색 LED task
Task t_GB(period_GB/blinking_GB, blinking_GB, Toggle_GB, &ts, false);// 초록색 깜박임 task
Task t_Blinking(500, TASK_FOREVER, blinking_func, &ts, false); // blinking_button task
Task t_Serial( 100, TASK_FOREVER, &CheckSerialInput, &ts, true);// Serial 통신 task
Task t_LL( 100, TASK_FOREVER, &lightIndicator, &ts, true);//  가변저항 값 확인 task

void setup() {
  Serial.begin(9600); 
  pinMode( LED_R, OUTPUT );
  pinMode( LED_Y, OUTPUT );
  pinMode( LED_G, OUTPUT );
  pinMode( stop_button, INPUT_PULLUP );// 버튼 -> INPUT_PULLUP으로 설정 (기본 HIGH)
  pinMode( onoff_button, INPUT_PULLUP );// 위와 동일
  pinMode( blinking_button, INPUT_PULLUP );// 위와 동일

  attachPCINT(digitalPinToPCINT(stop_button), stop_pressed, FALLING);// 버튼 눌렀을 때 인터럽트 발생 (FALLING으로 설정한 이유는 토글 형식으로 사용하기 위함 -> HIGH에서 LOW로 변경될 때만 인터럽트 발생)  
  attachPCINT(digitalPinToPCINT(onoff_button), onoff_pressed, FALLING);// 위와 동일
  attachPCINT(digitalPinToPCINT(blinking_button), blinking_pressed, FALLING);// 위와 동일
  t_R.restartDelayed(); // 빨간색 LED 주기만큼 지연시킨 후 시작
}

void loop() {
  ts.execute(); // TaskScheduler 실행
}

void CheckSerialInput() { // Serial 통신을 통해 주기값을 변경하는 함수
  if (Serial.available() > 0) {
      String input = Serial.readStringUntil('\n');// 엔터 키가 입력될 때까지 읽기
      char LedColor = input.charAt(0); // 첫글자만 따로 저장하기
      input = input.substring(1); // 첫글자 제외한 나머지 문자열을 input에 저장
      if (LedColor == 'R') { // 빨간색 주기 변경
        period_R = input.toInt(); // 주기값 초기화
        Serial.println("[" + String(millis()) + "] New period_R: " + period_R); // 변경된 주기값 출력
      }
      else if(LedColor == 'Y') { // 노란색 주기 변경
        period_Y = input.toInt(); // 주기값 초기화
        Serial.println("[" + String(millis()) + "] New period_Y: " + period_Y); // 변경된 주기값 출력
      }
      else if(LedColor == 'G') { // 초록색 주기 변경
        period_G = input.toInt(); // 주기값 초기화
        Serial.println("[" + String(millis()) + "] New period_G: " + period_G); // 변경된 주기값 출력
      }
  }
}

void lightIndicator() // 가변저항 값을 확인하고 LED 밝기 값으로 변환하는 함수
{
  lightLevel = map(analogRead(potPin), 0, 1023, 0, 255); // A0핀에서 읽은 가변저항 값(0~1023)을 LED 밝기 값(0~255)으로 변환하고, lightLevel에 저장
  Serial.println("Light Level: " + String(lightLevel)); // 변환된 LED 밝기 값 출력
}

void Enable_R() {
  analogWrite(LED_Y, LOW); // 노란색 LED 끄기
  analogWrite(LED_R, lightLevel); // 빨간색 LED 켜기
  Serial.println("[" + String(millis()) + "] LED_Y OFF"); // 노란색 LED OFF 출력
  Serial.println("[" + String(millis()) + "] LED_R ON"); // 빨간색 LED ON 출력
  redToGreen = true; // 빨간색 -> 초록색으로 넘어가는지 확인하는 변수 true로 변경
  t_Y.restartDelayed(period_R); // 빨간색 LED 주기만큼 지연시킨 후 노란색 LED task 시작
}

void Enable_Y() {
  if(redToGreen) { // 빨간색 -> 초록색으로 넘어가는 경우
    analogWrite(LED_R, LOW); // 빨간색 LED 끄기
    analogWrite(LED_Y, lightLevel); // 노란색 LED 켜기
    Serial.println("[" + String(millis()) + "] LED_R OFF"); // 빨간색 LED OFF 출력
    Serial.println("[" + String(millis()) + "] LED_Y ON"); // 노란색 LED ON 출력
    t_G.restartDelayed(period_Y); // 노란색 LED 주기만큼 지연시킨 후 초록색 LED task 시작
  }
  else { // 초록색 -> 빨간색으로 넘어가는 경우
    analogWrite(LED_G, LOW); // 초록색 LED 끄기
    analogWrite(LED_Y, lightLevel); // 노란색 LED 켜기
    Serial.println("[" + String(millis()) + "] LED_G OFF"); //  초록색 LED OFF 출력
    Serial.println("[" + String(millis()) + "] LED_Y ON"); // 노란색 LED ON 출력
    t_R.restartDelayed(period_Y); // 노란색 LED 주기만큼 지연시킨 후 빨간색 LED task 시작
  }
}

bool greenState; // 초록색 LED 상태를 저장하는 변수
int blink_Counter; // 초록색 깜박임 횟수를 저장하는 변수
void Enable_G() {
  analogWrite(LED_Y, LOW); // 노란색 LED 끄기
  analogWrite(LED_G, lightLevel); // 초록색 LED 켜기
  Serial.println("[" + String(millis()) + "] LED_Y OFF"); // 노란색 LED OFF 출력
  Serial.println("[" + String(millis()) + "] LED_G ON"); // 초록색 LED ON 출력
  greenState = true; // 초록색 LED 상태를 true로 변경
  blink_Counter = 0; // 초록색 깜박임 횟수 초기화
  t_GB.restartDelayed(period_G); // 초록색 LED 주기만큼 지연시킨 후 초록색 깜박임 task 시작
}

void Toggle_GB()  { // 초록색 깜박임 함수
  blink_Counter++; // 초록색 깜박임 횟수 증가(7회째 될 때, 노란색 LED로 넘어감)
  if(blink_Counter == blinking_GB) { //횟수가 7회가 되면
    redToGreen = false; // 초록색 -> 빨간색으로 넘어가는 변수를 false로 변경
    t_Y.restart(); // 노란색 LED task 시작
  }
  greenState = greenState ^ 1; // 초록색 LED 상태를 토글 형식으로 변경
  analogWrite(LED_G, greenState ? lightLevel : LOW); // 초록색 LED 상태에 따라 LED 켜기/끄기
  if(greenState){ // 초록색 LED가 켜진 경우
    Serial.println("[" + String(millis()) + "] LED_G ON"); // 초록색 LED ON 출력
  }
  else { // 초록색 LED가 꺼진 경우
    Serial.println("[" + String(millis()) + "] LED_G OFF"); // 초록색 LED OFF 출력
  }
}

void stop_func() // stop_button을 눌렀을 때 빨간색 LED만 켜지는 함수
{
  analogWrite( LED_R, lightLevel ); // 빨간색 LED 켜기
  analogWrite( LED_Y, LOW ); // 노란색 LED 끄기
  analogWrite( LED_G, LOW ); // 초록색 LED 끄기
  Serial.println("[" + String(millis()) + "] LED_R ON"); // 빨간색 LED ON 출력
  Serial.println("[" + String(millis()) + "] LED_Y OFF");// 노란색 LED OFF 출력
  Serial.println("[" + String(millis()) + "] LED_G OFF");// 초록색 LED OFF 출력
}

void stop_pressed() // stop_button을 눌렀을 때 task들을 disable하고 stop_func 함수 실행
{
	static int mode_1 = 0;
	mode_1 = (mode_1 + 1) % 2; // mode_1을 토글 형식으로 값을 바꿔줌
	if (mode_1 == 0) // stop_button이 해제될 때
	{
    Serial.println("Normal"); // Normal 출력 (기본 상태)
    t_R.restart(); // 빨간색 LED task 시작
    t_Serial.restart(); // Serial 통신 task 시작
    t_LL.restart(); // 가변저항 값 확인 task 시작
	}
	else if (mode_1 == 1) // stop_button이 눌렸을 때
	{
    ts.disableAll(); // 모든 task들을 disable
    stop_func(); // stop_func 함수 실행
    Serial.println("Button1 ON"); // 버튼1이 눌렸다는 메시지 출력
	}
}

void onoff_func() // onoff_button을 눌렀을 때 모든 LED가 꺼지는 함수
{
  // 모든 LED를 끄고, OFF 메시지 출력
  analogWrite( LED_R, LOW);
  analogWrite( LED_Y, LOW);
  analogWrite( LED_G, LOW);
  Serial.println("[" + String(millis()) + "] LED_R OFF");
  Serial.println("[" + String(millis()) + "] LED_Y OFF");
  Serial.println("[" + String(millis()) + "] LED_G OFF");
}

void onoff_pressed() // onoff_button을 눌렀을 때 onoff_func 함수 실행
{
	static int mode_2 = 0;
	mode_2 = (mode_2 + 1) % 2; // mode_1을 토글 형식으로 값을 바꿔줌
	if (mode_2 == 0) // onoff_button이 해제될 때
	{
    Serial.println("Normal"); // Normal 출력 (기본 상태)
    t_R.restart(); // 빨간색 LED task 시작
    t_Serial.restart(); //  Serial 통신 task 시작
    t_LL.restart(); // 가변저항 값 확인 task 시작
	}
	else if (mode_2 == 1) // onoff_button이 눌렸을 때
	{
    ts.disableAll(); // 모든 task들을 disable
    onoff_func(); // onoff_func 함수 실행
    Serial.println("Button2 ON"); // 버튼2가 눌렸다는 메시지 출력
	}
}

bool onoff = false; // 모든 LED의 ON/OFF 상태를 저장하는 변수
void blinking_func() // blinking_button을 눌렀을 때 모든 LED가 깜박이는 함수
{
  onoff = onoff^1; // onoff 변수를 토글 형식으로 변경
  if(onoff) { // onoff가 true인 경우
    // 모든 LED를 켜고, ON 메시지 출력
    analogWrite(LED_R, lightLevel);
    analogWrite(LED_Y, lightLevel);
    analogWrite(LED_G, lightLevel);
    Serial.println("[" + String(millis()) + "] LED_R ON");
    Serial.println("[" + String(millis()) + "] LED_Y ON");
    Serial.println("[" + String(millis()) + "] LED_G ON");
  }
  else { // onoff가 false인 경우
    // 모든 LED를 끄고, OFF 메시지 출력
    analogWrite(LED_R, LOW);
    analogWrite(LED_Y, LOW);
    analogWrite(LED_G, LOW);
    Serial.println("[" + String(millis()) + "] LED_R OFF");
    Serial.println("[" + String(millis()) + "] LED_Y OFF");
    Serial.println("[" + String(millis()) + "] LED_G OFF");
  }
}

void blinking_pressed() // blinking_button을 눌렀을 때 blinking_func 함수 실행
{
	static int mode_3 = 0;
	mode_3 = (mode_3 + 1) % 2; // mode_1을 토글 형식으로 값을 바꿔줌
	if (mode_3 == 0)
	{
    analogWrite(LED_Y, LOW); // 노란색 LED 끄기
    analogWrite(LED_G, LOW); // 
    Serial.println("[" + String(millis()) + "] LED_Y OFF"); // 노란색 LED OFF 출력
    Serial.println("[" + String(millis()) + "] LED_G OFF"); // 초록색 LED OFF 출력
    Serial.println("Normal"); // Normal 출력 (기본 상태)
    t_Blinking.disable(); // blinking_button task disable
    t_R.restart(); // 빨간색 LED task 시작
    t_Serial.restart(); // Serial 통신 task 시작
    t_LL.restart(); // 가변저항 값 확인 task 시작
	}
	else if (mode_3 == 1) // blinking_button이 눌렸을 때
	{
    ts.disableAll(); // 모든 task들을 disable
    t_Blinking.enable(); // blinking_button task enable
    t_Blinking.restart(); // blinking_button task 시작
    Serial.println("Button3 ON"); // 버튼3이 눌렸다는 메시지 출력
	}
}

#endif
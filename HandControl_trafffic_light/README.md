# HandControl_traffic_light
## 프로젝트 개요
- 이 프로젝트는 아두이노를 이용해 신호등 시스템을 구현하고, p5.js를 활용해 시스템 상태를 모니터링하고 제어할 수 있도록 설계되었습니다. LED 신호등을 구성하는 기본 기능 외에도 가변저항을 이용한 밝기 조절, 버튼을 통한 특정 기능 수행을 할 수 있습니다. p5.js에서는 손동작을 통해서 LED 주기를 변경하고, 기능을 변경할 수 있습니다. 
## 시연 영상
- Click [Here](https://youtu.be/ZuYE2wnVlNU)

## 주요 변경 사항
### 아두이노
#### 기능 변경
- 손동작을 통해 전송된 Serial 값을 통해 버튼에 할당된 함수 호출
#### 코드 변경

```c
void CheckSerialInput() { // Serial 통신을 통해 주기값을 변경하는 함수
  if (Serial.available() > 0) {
      String input = Serial.readStringUntil('\n');// 엔터 키가 입력될 때까지 읽기
      char command = input.charAt(0); // 첫글자만 따로 저장하기
      input = input.substring(1); // 첫글자 제외한 나머지 문자열을 input에 저장
      if (command == 'R') { // 빨간색 주기 변경
        period_R = input.toInt(); // 주기값 초기화
        Serial.println("[" + String(millis()) + "] New period_R: " + period_R); // 변경된 주기값 출력
      }
      else if(command == 'Y') { // 노란색 주기 변경
        period_Y = input.toInt(); // 주기값 초기화
        Serial.println("[" + String(millis()) + "] New period_Y: " + period_Y); // 변경된 주기값 출력
      }
      else if(command == 'G') { // 초록색 주기 변경
        period_G = input.toInt(); // 주기값 초기화
        Serial.println("[" + String(millis()) + "] New period_G: " + period_G); // 변경된 주기값 출력
      }
      else if(command == 'E') { // emergency mode 토글
        stop_pressed();
      }
      else if(command == 'O') { // OnOff mode 토글
        onoff_pressed();
      }
      else if(command == 'B') { // Blinking mode 토글
        blinking_pressed();
      }
      
  }
}
```
- 'E','O','B'는 각각 모드를 변경하기 위해 전송된 시리얼 값이다. 마지막에 else if문을 3개 추가하여, 해당 모드에 대한 함수가 호출되도록 하였다.

### P5.js
#### 기능 변경
1. 손동작을 통해서 각 LED 주기를 변경할 수 있도록 함 (색상을 손동작으로 선택 후, 주기 조절 손동작을 통해 변경함)
2. 손동작을 통해서 신호등의 모드를 변경할 수 있도록 함
#### 손동작 설명
| RED | YELLOW | GREEN | Period Up | Period Down | Emergency Button | OnOff Button | Blinking Button |
|--|--|--|--|--|--|--|--|
|<img src= "https://github.com/sjw2704/traffic_light_project/blob/main/HandControl_trafffic_light/p5/img/red.jpg" width="200" />|<img src= "https://github.com/sjw2704/traffic_light_project/blob/main/HandControl_trafffic_light/p5/img/yellow.jpg" width="200" />|<img src= "https://github.com/sjw2704/traffic_light_project/blob/main/HandControl_trafffic_light/p5/img/green.jpg" width="200" />|<img src= "https://github.com/sjw2704/traffic_light_project/blob/main/HandControl_trafffic_light/p5/img/up.jpg" width="200" />|<img src= "https://github.com/sjw2704/traffic_light_project/blob/main/HandControl_trafffic_light/p5/img/down.jpg" width="200" />|<img src= "https://github.com/sjw2704/traffic_light_project/blob/main/HandControl_trafffic_light/p5/img/Eb.jpg" width="200" />|<img src= "https://github.com/sjw2704/traffic_light_project/blob/main/HandControl_trafffic_light/p5/img/Ob.jpg" width="200" />|<img src= "https://github.com/sjw2704/traffic_light_project/blob/main/HandControl_trafffic_light/p5/img/Bb.jpg" width="200" />|
#### 사용방법 및 주의 사항
- 오른손으로 인식을 시켜야 오류가 적음
- LED 주기를 조절하기 위해서는 먼저 조절하고 싶은 LED 색상에 맞는 손 동작을 인식시켜야 함
- LED 주기 단위 조절 방법
```java
let p_Unit = 500; // 초기화 한 값만큼 주기가 증가하고 감소합니다
```
- 손 인식 주기 조절 방법
```java
setInterval(detecting_Hand, 1500); // 1500ms 마다 손 동작을 인식합니다. 값을 조절하여 인식 주기를 조절할 수 있습니다. 
```

#### 주요 코드 추가 및 변경
**detecting_Hand()**
  
```java
function detecting_Hand()
{
  //손동작을 확인을 주관하는 함수
  if(hands.length > 0){
    let hand = hands[0]; // 첫 번째 손을 가져옴
      let thumbTip = hand.keypoints[4];  // 엄지 끝
      let thumbBase = hand.keypoints[3]; // 엄지 관절
    
      let indexTip = hand.keypoints[8];   // 검지 끝
      let indexBase = hand.keypoints[6];  // 검지 관절

      let middleTip = hand.keypoints[12];  // 중지 끝
      let middleBase = hand.keypoints[10];  // 중지 관절

      let ringTip = hand.keypoints[16];  // 약지 끝
      let ringBase = hand.keypoints[14];  // 약지 관절

      let pinkyTip = hand.keypoints[20];  // 소지 끝
      let pinkyBase = hand.keypoints[18]; // 소지 관절

      let isIndexUp = indexTip.y < indexBase.y; // 검지 손가락이 위로 펴짐
      let isIndexDown = !isIndexUp; // 검지 손가락이 접힘
      let isIndexDownX = indexTip.x < indexBase.x; // 검지 손가락이 접힘

      let isMiddleUp = middleTip.y < middleBase.y; // 중지 위로 펴짐
      let isMiddleDown = !isMiddleUp; // 중지 접힘
      let isMiddleDownX = middleTip.x < middleBase.x; // 중지 접힘

      let isRingUp = ringTip.y < ringBase.y; // 약지 위로 펴짐
      let isRingDown = !isRingUp // 약지 접힘
      let isRingDownX = ringTip.x < ringBase.x;// 약지 접힘

      let isPinkyUp = pinkyTip.y < pinkyBase.y; // 소지 위로 펴짐
      let isPinkyDown = !isPinkyUp;
      let isPinkyDownX = pinkyTip.x < pinkyBase.x;
      
      let isThumbUp = thumbTip.y < thumbBase.y; // 엄지 접힘
      let isThumbDown = !isThumbUp; // 엄지 위로 펴짐
      let isThumbDownX = thumbTip.x < thumbBase.x; // 엄지 위로 펴짐
    
    //손동작을 구분해주는 함수들을 호출함
    HandForColor(isIndexUp,isMiddleUp,isMiddleDown,isRingUp,isRingDown,isPinkyUp,isPinkyDown,isThumbDownX);
    HandForUpDown(isIndexDownX,isMiddleDownX,isRingDownX,isPinkyDownX,isThumbUp,isThumbDown);
    HandForButton(isIndexUp,isIndexDown,isMiddleUp,isMiddleDown,isRingUp,isRingDown,isPinkyUp,isThumbDown);
  }
}
```
- ml5에서 읽어온 손가락 마디 마다의 좌표, 그리고 이것을 손가락을 올렸는지 내렸는지 판단하는 bool값의 변수를 만들었다. 그리고 이 값들은 손동작을 구분해주는 파라미터로 사용된다.

**주기를 나타내는 인디케이터**
```java
function draw_PeriodIndicator(){
  //LED 주기가 변한 것을 일직선 인디케이터로 표현함
  let R_indicatorLength = map(period_R, 500, 5000, 0, 350); // 500~500ms 주기를 0~350(직선 길이)로 맵핑함
  let Y_indicatorLength = map(period_Y, 500, 5000, 0, 350);
  let G_indicatorLength = map(period_G, 500, 5000, 0, 350);
  
  // 선의 스타일 설정
  stroke(0, 122, 255);
  strokeWeight(8);
  
  // 직선 인디케이터: 각 라인 시작점에서 indicatorLength 만큼의 선 그리기
  line(20, 70, 20 + R_indicatorLength, 70);
  line(20, 120, 20 + Y_indicatorLength, 120);
  line(20, 170, 20 + G_indicatorLength, 170);

  //stroke 값 초기화
  noStroke();
}
```
- 슬라이더로 값을 조절하는 것이 아닌, 손동작을 통해 주기를 조절하기 때문에 값이 변함에 따라 시각적으로 표현해주는 직선 인디케이터를 제작함.

### UI
<img src= "https://github.com/sjw2704/traffic_light_project/blob/main/HandControl_trafffic_light/p5/img/UI.png" width="600" />
- 기존에 제작했던 UI와 더불어 카메라를 배치함으로써 손동작이 잘 인식되고 있는지 확인하도록 함

## 시스템 구성
### 하드웨어 구성
![Screenshot 2025-03-15 at 2 31 31 AM](https://github.com/user-attachments/assets/0e2ea0e3-c5ec-4013-8a9a-ebf9c96dc8e8)

| 부품             | 세부사항    |
|------------------|-------------|
| 아두이노         | -           |
| 빨간색 LED       | 11번 PIN    |
| 노란색 LED       | 10번 PIN    |
| 초록색 LED       | 9번 PIN     |
| 가변저항         | A0 PIN      |
| Emergency 버튼   | 2번 PIN     |
| OnOff 버튼       | 3번 PIN     |
| Blinking 버튼    | 4번 PIN     |

![IMG_9863](https://github.com/user-attachments/assets/0ba30539-9682-4fe4-a325-22244b90b11b)
실제 회로도 구성입니다.


  
### 소프트웨어 구성
- 아두이노 코드 (C++):

  스케줄러 TASK 활용
  
  LED 제어
  
  가변저항 값 읽기

  버튼 이벤트 처리

  Serial 통신
  
- p5.js 코드 (JavaScript):

  Serial 데이터 수신 및 송신

  UI 구성

  손 인식


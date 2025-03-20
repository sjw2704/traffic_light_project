## traffic_light
### 프로젝트 개요
이 프로젝트는 아두이노를 이용해 신호등 시스템을 구현하고, p5.js를 활용해 시스템 상태를 모니터링하고 제어할 수 있도록 설계되었습니다. LED 신호등을 구성하는 기본 기능 외에도 가변저항을 이용한 밝기 조절, 버튼을 통한 특정 기능 수행, p5.js에서의 슬라이더를 통한 깜빡임 주기 조절이 포함되어 있습니다.
### 시연 영상
아래 사진을 클릭하면 영상을 확인하실 수 있습니다.

[![IMG_919780800AD1-1](https://github.com/user-attachments/assets/ddd2dbb5-5e78-4b77-93d7-8d0f62259aac)](https://youtu.be/L_uvkuZ81gY?si=hmlvzBMkgW0azqUM)

### 주요 기능
- 신호등 제어: 빨간색, 노란색, 초록색 LED를 이용한 신호등 구현
- 가변저항 활용: LED의 밝기를 가변저항 값에 따라 조절
- 버튼 기능:
  
  버튼 1: emergency mode(빨간색 LED만 켜짐)
  
  버튼 2: OnOff mode(모든 LED가 꺼짐)
  
  버튼 3: blinking mode(모든 LED가 500ms 주기로 깜빡임)
- p5.js 연동:

  Serial 통신을 통해 신호등 상태를 p5.js에서 실시간 모니터링
  
  슬라이더를 이용해 LED의 깜빡임 주기 조절 가능

### 시스템 구성도
#### 하드웨어 구성
![Screenshot 2025-03-15 at 2 31 31 AM](https://github.com/user-attachments/assets/0e2ea0e3-c5ec-4013-8a9a-ebf9c96dc8e8)
- 아두이노 보드
- 빨간색 LED(11번 PIN), 노란색 LED(10번 PIN), 초록색 LED(9번 PIN)
- 가변저항(A0 PIN)
- Emergency 버튼(2번 PIN)
- OnOff 버튼(3번 PIN)
- Blinking 버튼(4번 PIN)
- 저항 및 배선

![IMG_9863](https://github.com/user-attachments/assets/0ba30539-9682-4fe4-a325-22244b90b11b)
실제 회로도 구성입니다.
  
#### 소프트웨어 구성
- 아두이노 코드 (C++):

  스케줄러 TASK 활용
  
  LED 제어
  
  가변저항 값 읽기

  버튼 이벤트 처리

  Serial 통신
  
- p5.js 코드 (JavaScript):

  Serial 데이터 수신 및 송신

  UI 구성

  슬라이더를 통한 깜빡임 주기 조절

### 사용 방법
![Screenshot 2025-03-15 at 11 36 55 PM](https://github.com/user-attachments/assets/d0a01d2f-468a-48f1-b0e0-996588381080)

1 아두이노 코드 업로드

![Screenshot 2025-03-15 at 11 39 23 PM](https://github.com/user-attachments/assets/7c5a1e4a-256a-400a-b975-42bc03e630c4)

2 P5.js에서 시리얼 포트 연결

![IMG_9864](https://github.com/user-attachments/assets/51f763c2-3d8b-4270-bcf4-349f5f0abbc6)

3 가변저항, 버튼을 이용하여 신호등 제어

![Screenshot 2025-03-15 at 11 43 49 PM](https://github.com/user-attachments/assets/6c49b26c-ad49-4f7c-89ec-25a4233b36dd)


4 p5.js UI를 통해 시스템 체크 및 신호등 주기 조절

## HandControl_traffic_light

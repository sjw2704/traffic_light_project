//serial 통신 및 UI 변수
let port;
 let connectBtn; // 버튼 객체
 let circleColor_R = 'gray'; // 초기 색상
 let circleColor_Y = 'gray'; // 초기 색상
 let circleColor_G = 'gray'; //

 let period_Color = 'Red'; // 손동작으로 LED 주기 조절을 위한 색상 변수
 let period_R = 2000; // 빨간색 LED 주기 (기본 값)
 let period_Y = 500; // 노란색 LED 주기 (기본 값)
 let period_G = 2000; // 초록색 LED 주기 (기본 값)
 let p_Unit = 500; // 손동작에 따른 주기 증가 단위

 let progress = 0; // LED 밝기 값을 나타냄
 let receivedData = ""; // 시리얼 데이터 수신 문자열 변수
 let mode = "Normal"; // 신호등 모드를 나타내는 문자열 변수
//핸드포즈 인식 변수
 let handPose;
 let video;
 let hands = [];
 let v_width = 640;
 let v_height = 480;
 let pose = 'none';
 let CtoU = 0;
 let UtoB = 0;

 //핸드포즈 모델 로드
 function preload(){
  // Load the handPose model
  handPose = ml5.handPose();
}
 
 function setup() {
  createCanvas(1190, 480); // 캔버스 생성
  //비디오 출력 변수 설정
  video = createCapture(VIDEO);
  video.size(v_width, v_height);
  video.position(width,0);
  video.hide();
  handPose.detectStart(video, gotHands);

  angleMode(DEGREES); // 각도 단위를 도로 설정

  port = createSerial(); // web serial control object
 
  let usedPorts = usedSerialPorts(); // 사용중인 시리얼 포트 목록
  if (usedPorts.length > 0) { // 사용중인 포트가 있으면 첫번째 포트를 연다
    port.open(usedPorts[0], 9600); // 첫번째 포트를 9600 bps로 연다
  }
 
  // Web serial connect button setting
  connectBtn = createButton("Connect to Arduino"); // 버튼 생성
  connectBtn.position(432, 240); // 버튼 위치 설정
  connectBtn.mousePressed(connectBtnClick); // 버튼 클릭 이벤트 핸들러 설정

  setInterval(detecting_Hand, 1500);//손동작 인식하여 Serial 통신으로 값 보내기
 }
 
 function draw() {
  background(40);
  
  // 시리얼 포트 연결 상태에 따라 버튼 텍스트 변경
  if (!port.opened()) {
    connectBtn.html("Connect");
  } else {
    connectBtn.html("Disconnect");
  }

  //주기를 나타내는 직선 인디케이터 
  stroke(200); // 검정색 선
  strokeWeight(8); // 선의 두께
  line(20, 70, 20 + 350, 70);
  line(20, 120, 20 + 350, 120);
  line(20, 170, 20 + 350, 170);
  stroke(0); // 검정색 선
  strokeWeight(0); // 선의 두께

  serial_RX();// 시리얼 값을 읽어오고 UI에 반영
  main_Text();// UI의 주요 텍스트 입력
  draw_TrafficLight();// LED_State에 따라서 신호등 그리기
  draw_PeriodIndicator();//LED_Period에 따라서 직선 인디케이터 그리기
  draw_LevelIndicator();// LED_Level에 따라서 원형 인디케이터 그리기
  draw_Hand(); // 비디오에 손 Landmarks 표시하기

  fill(50);
  textSize(20);
  text("POSE : " + pose, 575, 45);

 }

//========================= Serial 통신 및 UI 제어 함수 =========================

 function serial_RX(){
  let n = port.available(); // 시리얼 포트로부터 수신된 데이터의 바이트 수
  if(n > 0){
    let str = port.readUntil("\n"); // 줄바꿈 문자가 나올 때까지 읽기
    textSize(15);
    fill(150);// 텍스트 색상 설정
    text("msg: " + str, 25, 257); // 수신된 메시지 표시

    LED_State(str);
    LED_Level(str);
    Mode_State(str);
  }
 }

 function LED_State(str){
    // 각 LED의 상태를 확인하여 색상 변경하는 부분
     if (str.includes("LED_R ON")) { // 문자열에 "LED_R ON"이 포함되어 있으면
      circleColor_R = 'red'; // 빨간색으로 변경
    } else if (str.includes("LED_R OFF")) {  // 문자열에 "LED_R OFF"이 포함되어 있으면
      circleColor_R = 'gray';  // 회색으로 변경
    }
         
    if (str.includes("LED_Y ON")) {
      circleColor_Y = 'yellow';
    } else if (str.includes("LED_Y OFF")) {
      circleColor_Y = 'gray';
    }
         
    if (str.includes("LED_G ON")) {
      circleColor_G = 'green';
    } else if (str.includes("LED_G OFF")) {
      circleColor_G = 'gray';
    }
 } 

 function LED_Level(str){
     // LED 밝기 값 확인
     if (str.includes("Light Level")) { // 수신된 데이터에서 "Light Level" 문자열이 포함되어 있으면
      receivedData = trim(str); // 문자열의 앞뒤 공백 제거
      let numbersOnly = receivedData.replace(/\D/g, ""); // 숫자만 남기기
      let intValue = parseInt(numbersOnly); // 문자열을 정수로 변환
      progress = intValue; // LED 밝기 값 변수에 저장
     }
 }

 function Mode_State(str){
  if (str.includes("Button1")) { // 수신된 데이터에서 "Button1" 문자열이 포함되어 있으면
    mode = "Emergency"; // 모드를 "Emergency"로 변경
   }
   else if(str.includes("Button2")) { // 수신된 데이터에서 "Button2" 문자열이 포함되어 있으면
    mode = "OnOff"; // 모드를 "OnOff"로 변경
   }
   else if(str.includes("Button3")) { // 수신된 데이터에서 "Button3" 문자열이 포함되어 있으면
    mode = "Blinking"; // 모드를 "Blinking"로 변경
   }
   else if(str.includes("Normal")) { // 수신된 데이터에서 "Normal" 문자열이 포함되어 있으면
    mode = "Normal"; // 모드를 "Normal"로 변경
   }  
 }

 function main_Text(){
  //UI의 메인 텍스트들을 함수로 묶음
  fill(150);
  textSize(15);
  text("MODE : " + mode, 190, 398-100);

  fill(220);
  textSize(20);
  text("Period Controller", 25, 45);
  text("Lightness", 425, 45);
  text("Serial", 445, 230);
  text("MSG", 25, 230);
  text("TRAFFIC LIGHT", 25, 400-100);

  fill(150);
  textSize(10);
  text("Period_Red: " + period_R, 25, 90);
  text("Period_Yellow: " + period_Y, 25, 140);
  text("Period_Green: " + period_G, 25, 190);
 }

 function draw_TrafficLight(){
  fill(circleColor_R); // 색상 설정
  circle(100, 485-100, 130); // LED_R
  fill(100); // 텍스트 색상 설정
  textSize(20); // 텍스트 크기 설정
  text("R", 95, 490-100); // 텍스트 표시 'R'
  
  fill(circleColor_Y);
  circle(270, 485-100, 130); // LED_Y
  fill(100);
  text("Y", 265, 490-100);
  
  fill(circleColor_G);
  circle(440, 485-100, 130); // LED_G
  fill(100);
  text("G", 435, 490-100);
 }

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
 
function draw_LevelIndicator(){
  let x = 470; // x 좌표
  let y = 120; // y 좌표
  let r = 55; // 반지름

  noFill(); // 내부 원 채우기 없음
  stroke(200); // 테두리 색상 설정
  strokeWeight(5); // 테두리 두께 설정
  circle(x, y, r * 2); // 원 그리기

  stroke(0, 122, 255); // 테두리 색상 설정
  strokeWeight(5);  // 테두리 두께 설정
  noFill(); // 내부 원 채우기 없음
  let angle = map(progress, 0, 255, 0, 360); // 진행률을 각도로 변환
  arc(x, y, r * 2, r * 2, -90, -90 + angle); // -90도부터 시작 (위에서 아래로 진행)

  fill(150);
  noStroke();
  textAlign(x, y);
  textSize(13);
  text("light : " + progress, x-27, y+4); // 중앙에 LED 밝기 값 표시
}
 
 // 버튼 클릭 이벤트 핸들러
 function connectBtnClick() {
   if (!port.opened()) { // 포트가 열려 있지 않으면
     port.open(9600); // 포트를 9600 bps로 연다
   } else { // 포트가 열려 있으면
     port.close(); // 포트를 닫는다
   }
 }
 
 // 슬라이더 이벤트 핸들러
 function changePeriod_R() { // 빨간색 LED 주기 아두이노로 전송
   port.write("R" + period_R + "\n"); // 시리얼 포트로 문자열 전송 (R + 주기 + 줄바꿈) -> Arduino에서 어떤 LED를 제어할지 구분하기 위해 R, Y, G를 붙임
 }

 function changePeriod_Y() {  // 노란색 LED 주기 아두이노로 전송
  port.write("Y" + period_Y + "\n");
}

function changePeriod_G() { // 초록색 LED 주기 아두이노로 전송
  port.write("G" + period_G + "\n");
}

//========================= HandPose 인식 함수 =========================

function draw_Hand()
{
    //웹캡을 그림
  image(video, 550, 0, v_width, v_height);
    // 각 손가락 마디 마디의 keypoints들을 그림
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i]; // 손의 데이터를 가져옴
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j]; // keypoints의 좌표를 가져옴
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x + 550, keypoint.y, 10);
    }
  }
}

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
    CtoU = 0;
    UtoB = 0;
    HandForColor(isIndexUp,isMiddleUp,isMiddleDown,isRingUp,isRingDown,isPinkyUp,isPinkyDown,isThumbDownX);
    HandForUpDown(isIndexDownX,isMiddleDownX,isRingDownX,isPinkyDownX,isThumbUp,isThumbDown);
    HandForButton(isIndexUp,isIndexDown,isMiddleUp,isMiddleDown,isRingUp,isRingDown,isPinkyUp,isThumbDown);
  }
  else{
    pose = 'none';
  }
}

function HandForColor(isIndexUp,isMiddleUp,isMiddleDown,isRingUp,isRingDown,isPinkyUp,isPinkyDown,isThumbDownX)
{
  //LED 주기를 조절하기 위해 색상을 선택하는 손동작을 구분하는 함수
  if (isIndexUp && isMiddleDown && isRingDown && isPinkyDown && isThumbDownX) {
    console.log("Select Red");
    pose = 'Red';
    period_Color = "Red";
  }
  else if (isIndexUp && isMiddleUp && isRingDown && isPinkyDown && isThumbDownX) {
    console.log("Select Yellow");
    pose = 'Yellow';
    period_Color = "Yellow";
  }
  else if (isIndexUp && isMiddleUp && isRingUp && isPinkyDown && isThumbDownX) {
    console.log("Select Green"); 
    pose = 'Green';
    period_Color = "Green";
  }
}

function HandForUpDown(isIndexDownX,isMiddleDownX,isRingDownX,isPinkyDownX,isThumbUp,isThumbDown)
{
  //주기를 늘이거나 줄이는 손동작을 구분하는 함수
    if (isIndexDownX && isMiddleDownX && isRingDownX && isPinkyDownX && isThumbUp) {
        console.log("Period Up");
        pose = "Period Up";
        if(period_Color == "Red" && period_R >= 500 && period_R < 5000){
          period_R = period_R + p_Unit; // p_Unit만큼 주기를 늘임
          changePeriod_R(); // 아두이노로 주기값을 전송하는 함수를 호출함
        }
        else if(period_Color == "Yellow" && period_Y >= 500 && period_Y < 5000){
          period_Y = period_Y + p_Unit;
          changePeriod_Y();
        }
        else if(period_Color == "Green" && period_G >= 500 && period_G < 5000){
          period_G = period_G + p_Unit;
          changePeriod_G();
        }
      }
      else if (isIndexDownX && isMiddleDownX && isRingDownX && isPinkyDownX && isThumbDown) {
        console.log("Period Down");
        pose = "Period Down";
        if(period_Color == "Red" && period_R > 500 && period_R <= 5000){
          period_R = period_R - p_Unit; // p_Unit만큼 주기를 줄임
          changePeriod_R();
        }
        else if(period_Color == "Yellow" && period_Y > 500 && period_Y <= 5000){
          period_Y = period_Y - p_Unit;
          changePeriod_Y();
        }
        else if(period_Color == "Green" && period_G > 500 && period_G <= 5000){
          period_G = period_G - p_Unit;
          changePeriod_G();
        }
      }
}

function HandForButton(isIndexUp,isIndexDown,isMiddleUp,isMiddleDown,isRingUp,isRingDown,isPinkyUp,isThumbDown)
{
  //어떤 모드를 설정할 것인지 해당 손동작을 구분하는 함수
    if (isIndexDown && isMiddleUp && isRingUp && isPinkyUp) {
        console.log("emergency button");//응급 버튼
        pose = "emergency button";
        port.write("E\n");//아두이노로 모드 설정 값 전송
      }
      else if (isIndexUp && isMiddleDown && isRingUp && isPinkyUp) {
        console.log("OnOff button");//온오프 버튼
        pose = "OnOff button";
        port.write("O\n");
      }
      else if (isIndexUp && isMiddleUp && isRingDown && isPinkyUp) {
        console.log("blinking button");//깜빡임 버튼
        pose = "blinking button";
        port.write("B\n");
      }
}

// 손이 감지될 때마다 호출되는 콜백 함수
function gotHands(results) {
  hands = results;
}

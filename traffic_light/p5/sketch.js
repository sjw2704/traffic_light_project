let port;
 let connectBtn; // 버튼 객체
 let slider_R, slider_Y, slider_G; // 슬라이더 객체
 let circleColor_R = 'gray'; // 초기 색상
 let circleColor_Y = 'gray'; // 초기 색상
 let circleColor_G = 'gray'; // 
 let period_R = 2000; // 빨간색 LED 주기 (기본 값)
 let period_Y = 500; // 노란색 LED 주기 (기본 값)
 let period_G = 2000; // 초록색 LED 주기 (기본 값)
 let progress = 0; // LED 밝기 값을 나타냄
 let receivedData = ""; // 시리얼 데이터 수신 문자열 변수
 let mode = "Normal"; // 신호등 모드를 나타내는 문자열 변수
 
 function setup() {
   createCanvas(550, 600); // 캔버스 생성
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
 
   // 각 LED 주기를 조절하는 슬라이더 생성
   slider_R = createSlider(500, 5000, period_R, 10); // 500에서 5000까지 10단위로 슬라이더 생성
   slider_R.position(20, 60); // 슬라이더 위치 설정
   slider_R.size(350); // 슬라이더 크기 설정
   slider_R.mouseReleased(changeSlider_R); // 슬라이더 놓았을 때 이벤트 핸들러 설정

   slider_Y = createSlider(500, 5000, period_Y, 10);
   slider_Y.position(20, 110);
   slider_Y.size(350);
   slider_Y.mouseReleased(changeSlider_Y); 

   slider_G = createSlider(500, 5000, period_G, 10);
   slider_G.position(20, 160);
   slider_G.size(350); 
   slider_G.mouseReleased(changeSlider_G); 

 }
 
 function draw() {
  
  // 시리얼 포트 연결 상태에 따라 버튼 텍스트 변경
  if (!port.opened()) {
    connectBtn.html("Connect");
  } else {
    connectBtn.html("Disconnect");
  }

  let n = port.available(); // 시리얼 포트로부터 수신된 데이터의 바이트 수
   if (n > 0) {
     let str = port.readUntil("\n"); // 줄바꿈 문자가 나올 때까지 읽기
     background(40);// 배경색 설정
     fill(150);// 텍스트 색상 설정
     text("msg: " + str, 25, 257); // 수신된 메시지 표시

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

     // LED 밝기 값 확인
     if (str.includes("Light Level")) { // 수신된 데이터에서 "Light Level" 문자열이 포함되어 있으면
      receivedData = trim(str); // 문자열의 앞뒤 공백 제거
      let numbersOnly = receivedData.replace(/\D/g, ""); // 숫자만 남기기
      let intValue = parseInt(numbersOnly); // 문자열을 정수로 변환
      progress = intValue; // LED 밝기 값 변수에 저장
     }

     // 모드 확인
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

   // 텍스트 표시
   fill(150);
   textSize(15);
   text("MODE : " + mode, 190, 398); // 모드 표시

   fill(220);
   textSize(20);
   text("Period Controller", 25, 45);
   text("Lightness", 425, 45);
   text("Serial", 445, 230);
   text("MSG", 25, 230);

   fill(250);
   textSize(20);
   text("TRAFFIC LIGHT", 25, 400);

   fill(150);
   textSize(10);
   text("Period_Red: " + period_R, 25, 90);
   text("Period_Yellow: " + period_Y, 25, 140);
   text("Period_Green: " + period_G, 25, 190);
 
   // 신호등 원 그리기
   fill(circleColor_R); // 색상 설정
   circle(100, 485, 130); // LED_R
   fill(100); // 텍스트 색상 설정
   textSize(20); // 텍스트 크기 설정
   text("R", 95, 490); // 텍스트 표시 'R'
   
   fill(circleColor_Y);
   circle(270, 485, 130); // LED_Y
   fill(100);
   text("Y", 265, 490);
   
   fill(circleColor_G);
   circle(440, 485, 130); // LED_G
   fill(100);
   text("G", 435, 490);

  // LED 밝기 원형 인디케이터로 표현하기
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
 function changeSlider_R() { // 빨간색 LED 주기 조절
   period_R = String(slider_R.value()); // 슬라이더 값 문자열로 변환
   port.write("R" + period_R + "\n"); // 시리얼 포트로 문자열 전송 (R + 주기 + 줄바꿈) -> Arduino에서 어떤 LED를 제어할지 구분하기 위해 R, Y, G를 붙임
 }

 function changeSlider_Y() {  // 노란색 LED 주기 조절
  period_Y = String(slider_Y.value()); 
  port.write("Y" + period_Y + "\n");
}

function changeSlider_G() { // 초록색 LED 주기 조절
  period_G = String(slider_G.value());
  port.write("G" + period_G + "\n");
}
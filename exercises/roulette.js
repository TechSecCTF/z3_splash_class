var options = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36'];

var startAngle = 0;
var arc = Math.PI / (options.length / 2);
var spinTimeout = null;

var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;
var MASK = 0xFFFFFFFF

var ctx;
var desiredText = "";
var wager = "";
var guess = "";
var bank = "";

// document.getElementById("spin").addEventListener("click", spin);
document.getElementById("gamble").addEventListener("click", gamble);

function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(
    n & 0x0F, 1);
}

function RGB2Color(r, g, b) {
  return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxitem) {
  if (item == 0){
    return 'green';
  } else if (item % 2 == 0) {
   return '#ee0000';
  } else {
    return '#000000';
  }
}

class XoRRayhulRNG {
  constructor(s0, s1) {
    this.s0 = s0;
    this.s1 = s1;
  }

  xorrayhul64p(){
    var s0 = (this.s0>>>0) & MASK;
    var s1 = (this.s1>>>0) & MASK; 

    var r = (s0 + s1)>>>0 & MASK;

    s1 = ((s0 ^ s1)>>>0) & MASK;
    this.s0 = ((((s0 << 23)>>>0 | s0 >>> (32 - 23)) & MASK) ^ s1 ^ (s1 << 7)>>>0) & MASK;
    this.s1 = ((s1 << 18)>>>0 | s1 >>> (32 - 18)) & MASK;
    return r;
  }

  gen_rand(){
    var r = this.xorrayhul64p() & 0x1FFFFFF;
    console.log("r:", r);
    var index = r % 37;
    var text = options[index];
    return text;
  }
}

rng = new XoRRayhulRNG(Math.floor(Math.random()*Math.pow(2, 32)), Math.floor(Math.random()*Math.pow(2, 32)));

function drawRouletteWheel() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var outsideRadius = 200;
    var textRadius = 160;
    var insideRadius = 125;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 500, 500);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    ctx.font = 'bold 12px Helvetica, Arial';

    for (var i = 0; i < options.length; i++) {
      var angle = startAngle + i * arc;
      //ctx.fillStyle = colors[i];
      ctx.fillStyle = getColor(i, options.length);
      ctx.beginPath();
      ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
      ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur = 0;
      ctx.shadowColor = "rgb(220,220,220)";
      ctx.fillStyle = "black";
      ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius,
        250 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = options[i];
      // console.log("text", text, "angle", angle);
      ctx.fillStyle = 'white';
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }

    //Arrow
    ctx.fillStyle = "silver";
    ctx.beginPath();
    ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));
    ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.fill();
  }
}

function gamble(){
   wager = document.getElementById('wager').value;
   wager = parseInt(wager)
   guess = document.getElementById('guess').value;
   spin(); 
}

function spin() {
  spinAngleStart = 10;

  // Generate random number
  desiredText = rng.gen_rand();

  spinTime = 0;
  spinTimeTotal = 2000;
  rotateWheel();
}

function rotateWheel(callback) {
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  var text = options[index];

  spinTime += 30;

  if (desiredText == text && spinTime >= spinTimeTotal) {
    stopRotateWheel(function(){
         if (guess == desiredText) {
          alert("Winner! Payout: $" + wager*35);
         } else {
          alert("Better luck next time :(");
         }
    });
    return;
  }

  var spinAngle = spinAngleStart;
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 30);
}

function stopRotateWheel(callback) {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  var text = options[index]
  ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
  ctx.restore();
  callback();
}

function easeOut(t, b, c, d) {
  var ts = (t /= d) * t;
  var tc = ts * t;
  return b + c * (tc + -3 * ts + 3 * t);
}

drawRouletteWheel();

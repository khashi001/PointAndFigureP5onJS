//json data
var jsonMarketData;
var jsonPafiParameter;
//Instances
var marketData;
var pafiCanvas;
var snapshot;
//Constants
var MARGIN_ROW = 2;
var MARGIN_YAXIS_LABEL = 30;
var MARGIN_TITLE_BAR = 50;
var PAFI_CELL_SIZE = 10;
var PAFI_COLUMN_NUM = 100; //tekitou


// Market Data Class
MarketData = function(){
  this.instrument = jsonMarketData.instrument;
  this.granularity = jsonMarketData.granularity;
  this.candles = jsonMarketData.candles;
  this.boxSize = jsonPafiParameter.BoxSize;
  this.reversalAmount = jsonPafiParameter.ReversalAmount;
  this.instrument;
  this.granularity;
  this.candles;
  this.maxPrice = 0;
  this.minPrice = 0;
  this.rowNum;
  this.columnNum;
  this.boxSize;
  this.reversalAmount;
  };
  
MarketData.prototype.initParam = function(){
  this.instrument = jsonMarketData.instrument;
  this.granularity = jsonMarketData.granularity;
  this.candles = jsonMarketData.candles;
  this.boxSize = jsonPafiParameter.BoxSize;
  this.reversalAmount = jsonPafiParameter.ReversalAmount;
  this.makeScale();
  
};


MarketData.prototype.makeScale = function(){
    
    for(var i=0; i<this.candles.length; i++){
      if (this.maxPrice < this.candles[i].mid.h){
        this.maxPrice = this.candles[i].mid.h;
      }
      if (this.minPrice == 0){
        this.minPrice = this.candles[i].mid.l;
      }
      else if (this.minPrice > this.candles[i].mid.l){
        this.minPrice = this.candles[i].mid.l;
      }      
    }
    console.log(this.maxPrice);
    console.log(this.minPrice);

    this.rowNum = MARGIN_ROW + parseInt((this.maxPrice - this.minPrice)/this.boxSize);
    console.log("rowNum = " + this.rowNum);
    this.columnNum = parseInt((windowWidth-MARGIN_YAXIS_LABEL)/PAFI_CELL_SIZE);
    console.log("columnNum = " + this.columnNum);
}

// PaFi Canvas Class
PaFiCanvas = function(){
  this.height = PAFI_CELL_SIZE*marketData.rowNum+MARGIN_TITLE_BAR;
  this.width = PAFI_CELL_SIZE*marketData.columnNum+MARGIN_YAXIS_LABEL;
  
  console.log("width="+this.width);
  console.log("hight = "+this.height);  

}

PaFiCanvas.prototype.drawframe = function(){
  var i,x1=0,x2=0,y1=0,y2=0;
  //rows
  for(var i=0; i<marketData.rowNum; i++){
    var x1 = MARGIN_YAXIS_LABEL;
    var x2 = this.width;
    var y1 = MARGIN_TITLE_BAR + PAFI_CELL_SIZE*i;
    stroke(240);
    line(x1,y1,x2,y1);
  }

  //columns
  for(i=0; i<marketData.columnNum; i++){
    y1 = MARGIN_TITLE_BAR;
    y2 = this.height;PAFI_CELL_SIZE*i;
    x1 = MARGIN_YAXIS_LABEL + PAFI_CELL_SIZE*i;
    stroke(240);
    line(x1,y1,x1,y2);
  }

  //Title
  textSize(30);
  stroke(101,215,239);
  fill(101,215,239);
  text(marketData.instrument, this.width*0.1, MARGIN_TITLE_BAR*0.6);
  text(marketData.granularity, this.width*0.3, MARGIN_TITLE_BAR*0.6);

  //Date
  textSize(20);
  text(marketData.candles[0].time, this.width*0.4, MARGIN_TITLE_BAR*0.45);
  text(marketData.candles[marketData.candles.length-1].time, this.width*0.4, MARGIN_TITLE_BAR*0.90);
}


// SanpShots Class
SnapShot = function(){
  this.snapshots = [];
  this.boxSize = marketData.boxSize;
  this.reversalAmount = marketData.reversalAmount;
  this.rowMax;
  this.columnMax;

};

/*
  var figureMatrix = new FigureMatrix();
  figureMatrix.addNewColumn();
  snapshot = new SnapShot(marketData.candles[0].time,figureMatrix);
  snapshots.push(snapshot);
  
  console.log(figureMatrix);
  console.log(snapshots);
*/


//Main

function preload(){
  jsonPafiParameter = loadJSON('PafiParameter.json');
  jsonMarketData = loadJSON('EUR_JPY_D.json');
  console.log(jsonMarketData);
  console.log(jsonPafiParameter);
}

function setup() {  

  console.log("Start PaFi!");
  
  //Generate Market Data
  marketData = new MarketData();
  marketData.initParam();
  console.log(marketData);

  //Generate PaFi Canvas
  paFiCanvas = new PaFiCanvas();
  createCanvas(paFiCanvas.width, paFiCanvas.height); 
  background(10,10,10);
  frameRate(1);


  //Generate SnapShots
  snapshot = new SnapShot();

}

function draw() {
  paFiCanvas.drawframe();


}

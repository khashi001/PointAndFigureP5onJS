//json data
var jsonMarketData;
var jsonPafiParameter;
//Instances
var marketData;
var pafiCanvas;
var snapshots= [];
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
  // this.candles;
  this.maxPrice = 0;
  this.minPrice = 0;
  this.numOfRows;
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

MarketData.prototype.getRowNum = function(_price){
  var row = parseInt( (_price - this.minPrice) / this.boxSize );
  console.log("getRowNum: rowNum="+row+", _price="+_price+", boxSize="+this.boxSize);
  return row;
}


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
    // console.log(this.maxPrice);
    // console.log(this.minPrice);

    this.numOfRows = MARGIN_ROW + parseInt((this.maxPrice - this.minPrice)/this.boxSize);
    // console.log("numOfRows = " + this.numOfRows);
    this.columnNum = parseInt((windowWidth-MARGIN_YAXIS_LABEL)/PAFI_CELL_SIZE);
    // console.log("columnNum = " + this.columnNum);
}

// PaFi Canvas Class
PaFiCanvas = function(){
  this.height = PAFI_CELL_SIZE*marketData.numOfRows+MARGIN_TITLE_BAR;
  this.width = PAFI_CELL_SIZE*marketData.columnNum+MARGIN_YAXIS_LABEL;
  
  // console.log("width="+this.width);
  // console.log("hight = "+this.height);  

}

PaFiCanvas.prototype.drawframe = function(){
  var i,x1=0,x2=0,y1=0,y2=0;
  //rows
  for(var i=0; i<marketData.numOfRows; i++){
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
FigureCell = function(){
  this.symbol = "";
  this.comment = "";
};

FigureColumn = function(){
  this.cellss = [];
}

FigureMatrix = function(){
  this.columns = [];
};


SnapShot = function(_time){
  this.time = _time;
  // this.priceChange = "Default";
  this.trend = "Default";
  this.figureMatrix;

};

SnapShot.prototype.generateFirstSnapShot = function(){
  console.log("generateFirstSnapShot started.");
  var newFigureMatrix = new FigureMatrix();
  var newColumn = this.generateNewColumn();

  //set default value
  var newPrice = marketData.candles[0].mid.c;
  var newPriceRowNum = marketData.getRowNum(newPrice);
  newColumn.cellss[newPriceRowNum].symbol = "O";
  newColumn.cellss[newPriceRowNum].comment = "FirstData";

  newFigureMatrix.columns.push(newColumn);

  this.figureMatrix = newFigureMatrix;
  this.trend = "Up";

  console.log(this.figureMatrix);
  console.log("generateFirstSnapShot done.");


};


SnapShot.prototype.copyLatestSnapShot = function(){
  var newFigureMatrix = new FigureMatrix();
  var lastSnapShotID = snapshots.length-1;
  console.log("copyLatestSnapShot started.");
  
  var columnLength = snapshots[lastSnapShotID].figureMatrix.columns.length;
  console.log("columnLength="+columnLength);
  var i=0;
  for(var i=0; i<columnLength; i++){
    var newColumn = new FigureColumn();
    for(var j=0; j<marketData.numOfRows; j++){
      var newCell = new FigureCell();
      newCell.symbol = 
        snapshots[lastSnapShotID].figureMatrix.columns[i].cellss[j].symbol;
      newCell.comment = 
        snapshots[lastSnapShotID].figureMatrix.columns[i].cellss[j].comment;
      newColumn.cellss.push(newCell);
    }    
    newFigureMatrix.columns.push(newColumn);
  }
  this.figureMatrix = newFigureMatrix;
  this.trend = snapshots[lastSnapShotID].trend;
  console.log("copyLatestSnapShot done.");
};

SnapShot.prototype.updateFigureMatrix = function(_latestCandle){
  console.log("updateFigureMatrix started.");
  //detect price change
  var lastPrice = marketData.candles[_latestCandle-1].mid.c;
  var newPrice = marketData.candles[_latestCandle].mid.c;

  var lastPriceRowNum = marketData.getRowNum(lastPrice);
  var newPriceRowNum = marketData.getRowNum(newPrice);
  console.log("newPriceRowNum="+newPriceRowNum);

  var priceChange;
  if(lastPriceRowNum > newPriceRowNum){
    priceChange = "Down";
  }
  else if (lastPriceRowNum < newPriceRowNum){
    priceChange = "Up";
  }
  else{
    priceChange = "Keep";
  }

  //judge trend
  var lastTrend = this.trend;

  if (lastTrend == "Up"){
    if(priceChange == "Up"){
      //1.
      console.log("trend:Up priceChange:Up");      
      this.writeMergedCell(newPriceRowNum, "O", "");
    }
    else if(priceChange == "Down"){
      //2.
      console.log("  trend:Up priceChange:Down");    
      console.log("  lastPriceRowNum="+lastPriceRowNum);  
      console.log("  newPriceRowNum="+newPriceRowNum);
      console.log("  marketData.reversalAmount="+marketData.reversalAmount);
      if ((lastPriceRowNum - newPriceRowNum) > marketData.reversalAmount){
        //trend changed
        console.log("  trend change to Down.");
        var newColumn = this.generateNewColumn();
        this.figureMatrix.columns.push(newColumn);
        this.writeRangeCells(lastPriceRowNum-1, newPriceRowNum, "X");

        var newColumnID = this.figureMatrix.columns.length-1;
        this.figureMatrix.columns[newColumnID].cellss[lastPriceRowNum].comment = marketData.candles[_latestCandle].time;
        this.trend = "Down";
      }
      else{
        //do nothing
      }
    }
    else if(priceChange == "Keep"){
      console.log("trend:Up priceChange:Keep");      

      //3. do nothing      
    }
  }
  else if (lastTrend == "Down"){
    if(priceChange == "Up"){
      console.log("trend:Down priceChange:Up");      
      //4.
      if (( newPriceRowNum - lastPriceRowNum) > marketData.reversalAmount){
        //trend changed
        console.log("  trend change to Down.");
        var newColumn = this.generateNewColumn();
        // var newColumn = new FigureColumn();
        this.figureMatrix.columns.push(newColumn);
        this.writeRangeCells(lastPriceRowNum+1, newPriceRowNum, "O");
        var newColumnNum = this.figureMatrix.columns.length-1;
        this.figureMatrix.columns[newColumnNum].cellss[lastPriceRowNum].comment = marketData.candles[_latestCandle].time;

        this.trend = "Down";
      }
    }
    else if(priceChange == "Down"){
      console.log("trend:Down priceChange:Down");      
      //5. 
      //add symbol
      this.writeMergedCell(newPriceRowNum, "X", "");
    }
    else if(priceChange == "Keep"){
      console.log("trend:Down priceChange:Keep");      
      //6. do nothing      
    }
  }
  else {
    console.log("Unexpected trend data "+lastTrend+" in updateFigureMatrix in snapshot "+this.time);
  }

  console.log("lastTrend="+lastTrend+",priceChange="+priceChange+",newTrend="+this.trend);
  //update figure

  console.log("updateFigureMatrix done.");

}

SnapShot.prototype.generateNewColumn = function(){
  var newColumn = new FigureColumn();
  for(var i=0; i<marketData.numOfRows; i++){
    var newCell = new FigureCell();
    newColumn.cellss.push(newCell);
  }

  return newColumn;

}

SnapShot.prototype.generateLatestSnapShot = function(_latestCandle){
  //copy
  this.copyLatestSnapShot();
  //update
  this.updateFigureMatrix(_latestCandle);
}

SnapShot.prototype.writeRangeCells = function(_fromRow, _toRow, _symbol){
  console.log("writeRangeCells started with parameters:");
  console.log(_fromRow, _toRow, _symbol);

  var lastColumn = this.figureMatrix.columns.length-1;
  if(_fromRow < _toRow){
    for(var i=_fromRow; i<=_toRow; i++){
      this.figureMatrix.columns[lastColumn].cellss[i].symbol = _symbol;
    }
  }
  else{
    for(var i=_toRow; i<=_fromRow; i++){
      this.figureMatrix.columns[lastColumn].cellss[i].symbol = _symbol;
    }
  }
}

SnapShot.prototype.writeMergedCell = function(_row, _symbol, _comment){
  console.log("writeMergedCell started. _row="+_row+",_symbol="+_symbol);

  //search edge symbol 
  var lastColumn = this.figureMatrix.columns.length-1;
  // console.log("   _row="+_row+",_symbol="+_symbol);
  // console.log("   lastColumn="+lastColumn);
  // console.log(this.figureMatrix);
  var lowerEdge = 0;
  var higherEdge = 0;
  for(var i=0; i<marketData.numOfRows-1; i++){
    // console.log("   "+i);
    if(this.figureMatrix.columns[lastColumn].cellss[i].symbol=="" 
        && 
       this.figureMatrix.columns[lastColumn].cellss[i+1].symbol!=""){
      lowerEdge = i+1;
    }
    if(this.figureMatrix.columns[lastColumn].cellss[i].symbol!=""
        &&
        this.figureMatrix.columns[lastColumn].cellss[i+1].symbol==""){
      higherEdge = i+1;
    }
  }
  console.log("lowerEdge="+lowerEdge+", higherEdge="+higherEdge);

  //write Symbol
  if(_symbol=="O"){
    //from lower edge to _row
    for(var i=lowerEdge; i<_row+1; i++){
      this.figureMatrix.columns[lastColumn].cellss[i].symbol = "O";
    }
  }
  else if(_symbol=="X"){
    //from higher edge to _row
    for(var i=higherEdge; i>_row-1; i--){
      this.figureMatrix.columns[lastColumn].cellss[i].symbol = "X";
    }
  }
  else{
    //do nothing
    console.log("unexpedted _symbol in writeMergedCell: "+_symbol);
  }

  //write comment
  this.figureMatrix.columns[lastColumn].cellss[_row].comment = _comment;
  // console.log(this.figureMatrix.columns);
  console.log("writeMergedCell done.");

}

//Main

function preload(){
  jsonPafiParameter = loadJSON('PafiParameter.json');
  jsonMarketData = loadJSON('EUR_JPY_D.json');
  // console.log(jsonMarketData);
  // console.log(jsonPafiParameter);
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
  //First SnapShot
  var snapshot = new SnapShot(marketData.candles[0].time);
  snapshot.generateFirstSnapShot();
  snapshots.push(snapshot);
  console.log("### First SnapShots=");
  console.log(snapshots);

  //Second and after
  for (var i=1; i<marketData.candles.length; i++){
    console.log("### Snapshot "+i);
    var snapshot = new SnapShot(marketData.candles[i].time);
    snapshot.generateLatestSnapShot(i);
    snapshots.push(snapshot);

    console.log("snapshots=");
    console.log(snapshots);
  }



}

function draw() {
  paFiCanvas.drawframe();


}

//json data
var jsonMarketData;
var jsonPafiParameter;
//Instances
var marketData;
var paFiCanvas;
var snapShots = [];
var tradeRecords = [];
// var this.figureMatrix.tradePosition;
//Constants
var MARGIN_ROW = 2;
var MARGIN_YAXIS_LABEL = 30;
var MARGIN_TITLE_BAR = 50;
var MARGIN_XCELL = 2;
var PAFI_CELL_SIZE = 10;
var PAFI_COLUMN_NUM = 100; //tekitou
var MARGIN_RIGHT_COLUMN = 2;
var TRADE_AMOUNT = 10000; // DMM FX
var TRADE_FEE_RATE = 0.00002; //DMM FX
var INITIAL_DEPOSIT = 5000000;
//Iteration
var snapIterator = 0;
var aPressed = 0;
var nPressed = 0;
var sPressed = 0;

//Debug 
var debug_updateColumnNum = 0;
var debug_updateFigureMatrix = 0;
var debug_writeMergedCells = 0;
var debug_writeRangeCells = 0;
var debug_copyLatestSnapShot = 0;
var debug_getLastRowNum = 0;
var debug_drawMatrix = 0;
var debug_snapShotID = 340;
var debug_writePosition = 0;
var debug_generateFirstSnapShot = 1;
var debug_snapIterator = 0;

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
  // console.log("getRowNum: rowNum="+row+", _price="+_price+", boxSize="+this.boxSize);
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
    this.numOfRows = MARGIN_ROW + parseInt((this.maxPrice - this.minPrice)/this.boxSize);
    this.columnNum = parseInt((windowWidth-MARGIN_YAXIS_LABEL)/PAFI_CELL_SIZE);
}

MarketData.prototype.updateColumnNum = function(){
  if(debug_updateColumnNum){console.log("updateColumnNum");}
  if(debug_updateColumnNum){console.log(" shanpShots.length=",snapShots.length);}
  numOfColumn = snapShots[snapShots.length-1].figureMatrix.columns.length;
  if(debug_updateColumnNum){console.log(" numOfColumn = "+numOfColumn);}
  if(numOfColumn > this.columnNum){
    this.columnNum = numOfColumn;
  }
}


// PaFi Canvas Class
PaFiCanvas = function(){
  this.height = PAFI_CELL_SIZE*marketData.numOfRows+MARGIN_TITLE_BAR;
  this.width = PAFI_CELL_SIZE*marketData.columnNum+MARGIN_YAXIS_LABEL+MARGIN_RIGHT_COLUMN;
  console.log("PaFiCanvas: ",marketData.numOfRows,this.height);
}

PaFiCanvas.prototype.updateWidth = function(){
  console.log("updateWidth");
  this.width = PAFI_CELL_SIZE*marketData.columnNum+MARGIN_YAXIS_LABEL;
  console.log(" this.width="+this.width);
}

PaFiCanvas.prototype.drawLatestDate = function(snapID){
  textSize(30);
  stroke(201,235,139);
  fill(201,235,139);
  text(snapShots[snapID].time, this.width*0.1, MARGIN_TITLE_BAR*1.6);

}

PaFiCanvas.prototype.drawframe = function(){
  var i,x1=0,x2=0,y1=0,y2=0;
  //rows
  for(var i=0; i<marketData.numOfRows; i++){
    var x1 = MARGIN_YAXIS_LABEL;
    var x2 = this.width;
    var y1 = MARGIN_TITLE_BAR + PAFI_CELL_SIZE*i;
    if((marketData.numOfRows-i-1)%10 == 0){
      stroke(150);
    }
    else{
      stroke(100);
    }
    line(x1,y1,x2,y1);
  }

  //columns
  for(i=0; i<marketData.columnNum; i++){
    y1 = MARGIN_TITLE_BAR;
    y2 = this.height;PAFI_CELL_SIZE*i;
    x1 = MARGIN_YAXIS_LABEL + PAFI_CELL_SIZE*i;
    if((i-1)%10 == 0){
      stroke(150);
    }
    else{
      stroke(100);
    }
    line(x1,y1,x1,y2);
  }

  //Title
  textSize(30);
  stroke(101,215,239);
  fill(101,215,239);
  text(marketData.instrument, this.width*0.1, MARGIN_TITLE_BAR*0.6);
  text(marketData.granularity, this.width*0.3, MARGIN_TITLE_BAR*0.6);

  //Start and End date
  textSize(20);
  text(marketData.candles[0].time, this.width*0.4, MARGIN_TITLE_BAR*0.45);
  text(marketData.candles[marketData.candles.length-1].time, this.width*0.4, MARGIN_TITLE_BAR*0.90);


};

PaFiCanvas.prototype.drawMatrix = function(snapID){
  textSize(10);
  var latestFigureMatrix = snapShots[snapID].figureMatrix;
  for(var column=0; column < latestFigureMatrix.columns.length; column++){
    for(var row=0; row < marketData.numOfRows; row++){
      var symbol = latestFigureMatrix.columns[column].cellss[row].symbol;
      text(symbol, this.getCanvasXaxis(column),this.getCanvasYaxis(row));
      if(debug_drawMatrix){if(column==93 && symbol != ""){console.log(column,row,symbol);}}
    }
  }

};

PaFiCanvas.prototype.drawSigns = function(snapID){
  var row = snapShots[snapID].figureMatrix.tradePosition.row;
  var column = snapShots[snapID].figureMatrix.tradePosition.columnID;
  var c = color(244,35,114,100);
  stroke(c);
  fill(c);

  rect(this.getCanvasXaxis(column),this.getCanvasYaxis(row),PAFI_CELL_SIZE,PAFI_CELL_SIZE);


}

PaFiCanvas.prototype.getCanvasXaxis = function(_column){
  return MARGIN_YAXIS_LABEL + PAFI_CELL_SIZE * _column + MARGIN_XCELL;
};

PaFiCanvas.prototype.getCanvasYaxis = function(_row){
  return  MARGIN_TITLE_BAR + PAFI_CELL_SIZE*(marketData.numOfRows - _row);
};

// Trade Position Class
TradePosition = function(){
  this.date="";
  this.columnID=0;
  this.row=0;
  this.bs= "";
  this.amount=0;
  this.price=0;
}

TradePosition.prototype.writePosition = function( _date, _columnID, _row, _bs, _amount, _price){
  this.date = _date;
  this.columnID = _columnID;
  this.row = _row;
  this.bs = _bs;
  this.amount = _amount;
  this.price = _price;
  if(debug_writePosition){console.log("writePosition. ",_date, _columnID, _row, _bs, _amount, _price);}
}

TradePosition.prototype.entry = function(_sign, _time, _columnID, _row, _price){

  //update position
  this.writePosition(
    _time,
    _columnID, 
    _row,
    _sign,
    TRADE_AMOUNT, 
    _price);

  //generate record
  var newRecord = new TradeRecord();
  newRecord.pair = marketData.instrument;
  newRecord.bs = _sign;
  newRecord.entryDate = _time;
  newRecord.entryPrice = _price;
  newRecord.amount = TRADE_AMOUNT;
  newRecord.exitDate = "";
  newRecord.exitPrice = 0;
  newRecord.fee = _price * TRADE_AMOUNT * TRADE_FEE_RATE;
  newRecord.profitLoss = 0;
  newRecord.balance = 
    tradeRecords[tradeRecords.length-1].balance - 
    (_price * TRADE_AMOUNT + newRecord.fee);

  tradeRecords.push(newRecord);
  console.log("ENTRY ",_sign,_time,_columnID,_row,_price);
  
}


TradePosition.prototype.exit = function(_sign, _time, _columnID, _row, _price){
  this.writePosition(
    _time,
    _columnID, 
    _row,
    "",
    TRADE_AMOUNT, 
    _price);

  var record = tradeRecords[tradeRecords.length-1];
  record.exitDate = _time;
  if(record.bs == _sign){ console.log("Unexpected Operation in TradePosition:exit.");}
  record.exitPrice = _price;
  record.fee = record.fee + _price * TRADE_AMOUNT * TRADE_FEE_RATE;
  if(_sign == "Buy"){
    record.profitLoss = (record.exitPrice - record.entryPrice) * TRADE_AMOUNT * (1 - TRADE_FEE_RATE);
  }
  else{
    record.profitLoss = (record.entryPrice - record.exitPrice) * TRADE_AMOUNT * (1 - TRADE_FEE_RATE);
  }
  record.balance = record.balance + (_price * TRADE_AMOUNT) - record.fee;
  
  console.log("EXIT ",_sign,_time,_columnID,_row,_price);

}

//Trade Record Class
TradeRecord = function (){
  this.pair;
  this.bs;
  this.entrydate;
  this.entryPrice;
  this.amount;
  this.exitDate;
  this.exitPrice;
  this.fee;
  this.profitLoss;
  this.balance;
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
  this.tradePosition;
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
  var newTradePosition = new TradePosition();
  var newColumn = this.generateNewColumn();

  //set default value
  var newPrice = marketData.candles[0].mid.c;
  var newPriceRowNum = marketData.getRowNum(newPrice);
  newColumn.cellss[newPriceRowNum].symbol = "X";
  newColumn.cellss[newPriceRowNum].comment = "FirstData";

  newFigureMatrix.columns.push(newColumn);

  this.figureMatrix = newFigureMatrix;
  this.figureMatrix.tradePosition = newTradePosition;
  this.trend = "Up";

  if(debug_generateFirstSnapShot){
    console.log(this);
    console.log("generateFirstSnapShot done.");
  }

};


SnapShot.prototype.copyLatestSnapShot = function(){
  var newFigureMatrix = new FigureMatrix();
  var newTradePosition = new TradePosition();
  var lastSnapShotID = snapShots.length-1;
  if(debug_copyLatestSnapShot){console.log("copyLatestSnapShot started.");}
  if(debug_copyLatestSnapShot){console.log(lastSnapShotID);}
  if(debug_copyLatestSnapShot){console.log(snapShots[lastSnapShotID]);}
  var columnLength = snapShots[lastSnapShotID].figureMatrix.columns.length;
  // console.log("columnLength="+columnLength);
  var i=0;
  for(var i=0; i<columnLength; i++){
    var newColumn = new FigureColumn();
    for(var j=0; j<marketData.numOfRows; j++){
      var newCell = new FigureCell();
      newCell.symbol = 
        snapShots[lastSnapShotID].figureMatrix.columns[i].cellss[j].symbol;
      newCell.comment = 
        snapShots[lastSnapShotID].figureMatrix.columns[i].cellss[j].comment;
      newColumn.cellss.push(newCell);
    }    
    newFigureMatrix.columns.push(newColumn);
  }
  this.figureMatrix = newFigureMatrix;

  newTradePosition.writePosition(
                snapShots[lastSnapShotID].figureMatrix.tradePosition.date,
                snapShots[lastSnapShotID].figureMatrix.tradePosition.columnID,
                snapShots[lastSnapShotID].figureMatrix.tradePosition.row,
                snapShots[lastSnapShotID].figureMatrix.tradePosition.bs,
                snapShots[lastSnapShotID].figureMatrix.tradePosition.amount,
                snapShots[lastSnapShotID].figureMatrix.tradePosition.price
    );

  this.figureMatrix.tradePosition = newTradePosition;
  this.trend = snapShots[lastSnapShotID].trend;

  if(debug_copyLatestSnapShot){console.log(this);}
};

SnapShot.prototype.getLastRowNum = function(_columnID){
  var row = 0;
  var lastColumn = this.figureMatrix.columns[_columnID];
  if(this.figureMatrix.columns[_columnID].cellss[0].symbol == "O"){
    row = 0;
  }
  else if(lastColumn.cellss[marketData.numOfRows-1].symbol == "X"){
    row = marketData.numOfRows-1;
  }
  else{
    for(var i=0; i<marketData.numOfRows-1; i++){
      if(lastColumn.cellss[i].symbol == "X" && lastColumn.cellss[i+1].symbol ==""){
        row = i;
        break;
      }
      if(lastColumn.cellss[i].symbol == "" && lastColumn.cellss[i+1].symbol =="O"){
        row = i+1;
        break;
      }
    }
  }
  if(debug_getLastRowNum){console.log("     getLastRowNum done. column = "+lastColumnID+", row="+row);}
  return row;  
}

SnapShot.prototype.updateFigureMatrix = function(_latestCandle){
  if(_latestCandle <= debug_snapShotID){
    if(debug_updateFigureMatrix){console.log(_latestCandle+":updateFigureMatrix started.");}
  }
  //detect price change
  var lastPrice = marketData.candles[_latestCandle-1].mid.c;
  var newPrice = marketData.candles[_latestCandle].mid.c;

  var lastColumnID = this.figureMatrix.columns.length-1;
  var lastPriceRowNum = this.getLastRowNum(lastColumnID);
  // var lastPriceRowNum = marketData.getRowNum(lastPrice);
  var newPriceRowNum = marketData.getRowNum(newPrice);
  if(_latestCandle <= debug_snapShotID){
    if(debug_updateFigureMatrix){console.log("  lastPriceRowNum="+lastPriceRowNum);  }
    if(debug_updateFigureMatrix){console.log("  newPriceRowNum="+newPriceRowNum);}
  }
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
      if(_latestCandle <= debug_snapShotID){
        if(debug_updateFigureMatrix){console.log("trend:Up priceChange:Up");    }
      }
      this.writeMergedCell(this.figureMatrix.columns.length-1, newPriceRowNum, "X", "");
    }
    else if(priceChange == "Down"){
      //2.
    if(_latestCandle == debug_snapShotID){
      if(debug_updateFigureMatrix){console.log("  trend:Up priceChange:Down"); }
    }
      if ((lastPriceRowNum - newPriceRowNum) > marketData.reversalAmount){
        //trend changed
        if(_latestCandle == debug_snapShotID){
          if(debug_updateFigureMatrix){console.log("  trend change to Down.");}
        }
        var newColumn = this.generateNewColumn();
        this.figureMatrix.columns.push(newColumn);
        this.writeRangeCells(this.figureMatrix.columns.length-1, lastPriceRowNum-1, newPriceRowNum, "O");

        var newColumnID = this.figureMatrix.columns.length-1;
        this.figureMatrix.columns[newColumnID].cellss[lastPriceRowNum].comment = marketData.candles[_latestCandle].time;
        this.trend = "Down";
      }
      else{
        //do nothing
      }
    }
    else if(priceChange == "Keep"){
      if(_latestCandle <= debug_snapShotID){
        if(debug_updateFigureMatrix){console.log("trend:Up priceChange:Keep"); }
      }
      //3. do nothing      
    }
  }
  else if (lastTrend == "Down"){
    if(priceChange == "Up"){
    if(_latestCandle <= debug_snapShotID){
      if(debug_updateFigureMatrix){console.log("trend:Down priceChange:Up"); }
    }
      //4.
      if (( newPriceRowNum - lastPriceRowNum) > marketData.reversalAmount){
        //trend changed
        if(_latestCandle <= debug_snapShotID){
          if(debug_updateFigureMatrix){console.log("  trend change to Up.");}
        }
        var newColumn = this.generateNewColumn();
        this.figureMatrix.columns.push(newColumn);
        this.writeRangeCells(this.figureMatrix.columns.length-1,lastPriceRowNum+1, newPriceRowNum, "X");
        var newColumnNum = this.figureMatrix.columns.length-1;
        this.figureMatrix.columns[newColumnNum].cellss[lastPriceRowNum].comment = marketData.candles[_latestCandle].time;
        this.trend = "Up";
      }
    }
    else if(priceChange == "Down"){
      if(_latestCandle <= debug_snapShotID){
        if(debug_updateFigureMatrix){console.log("trend:Down priceChange:Down");}
      }
      //5. 
      //add symbol
      this.writeMergedCell(this.figureMatrix.columns.length-1,newPriceRowNum, "O", "");
    }
    else if(priceChange == "Keep"){
      if(_latestCandle <= debug_snapShotID){
        if(debug_updateFigureMatrix){console.log("trend:Down priceChange:Keep");}
      }
      //6. do nothing      
    }
  }
  else {
    if(debug_updateFigureMatrix){console.log("Unexpected trend data "+lastTrend+" in updateFigureMatrix in snapshot "+this.time);}
  }

  if(_latestCandle <= debug_snapShotID){
    if(debug_updateFigureMatrix){console.log("lastTrend="+lastTrend+",priceChange="+priceChange+",newTrend="+this.trend);}
    if(debug_updateFigureMatrix){console.log("latestColumnID ="+(this.figureMatrix.columns.length-1));}
  }

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
  //trade
  if(snapShots[snapShots.length-1].figureMatrix.columns.length >= 4){
    this.trade(_latestCandle);
  }
}

SnapShot.prototype.writeRangeCells = function(_column, _fromRow, _toRow, _symbol){
  if(debug_writeRangeCells){console.log("    writeRangeCells started with parameters:");}
  if(debug_writeRangeCells){console.log("    "+_column, _fromRow, _toRow, _symbol);}

  // var lastColumn = this.figureMatrix.columns.length-1;
  if(_fromRow < _toRow){
    for(var i=_fromRow; i<=_toRow; i++){
      this.figureMatrix.columns[_column].cellss[i].symbol = _symbol;
    }
  }
  else{
    for(var i=_toRow; i<=_fromRow; i++){
      this.figureMatrix.columns[_column].cellss[i].symbol = _symbol;
    }
  }
}

SnapShot.prototype.writeMergedCell = function(_column, _row, _symbol){
  if(debug_writeMergedCells){console.log("    writeMergedCell started.");}
  if(debug_writeMergedCells){console.log("    "+_column,_row,_symbol);}

  //search edge symbol 
  // var lastColumn = this.figureMatrix.columns.length-1;
  var lowerEdge = 0;
  var higherEdge = 0;
  for(var i=0; i<marketData.numOfRows-1; i++){
    if(this.figureMatrix.columns[_column].cellss[i].symbol=="" 
        && 
       this.figureMatrix.columns[_column].cellss[i+1].symbol!=""){
      lowerEdge = i+1;
    }
    if(this.figureMatrix.columns[_column].cellss[i].symbol!=""
        &&
        this.figureMatrix.columns[_column].cellss[i+1].symbol==""){
      higherEdge = i;
    }
  }
  if(debug_writeMergedCells){console.log("lowerEdge="+lowerEdge+", higherEdge="+higherEdge);}

  //write Symbol
  if(_symbol=="X"){
    //from lower edge to _row
    for(var i=lowerEdge; i<_row+1; i++){
      this.figureMatrix.columns[_column].cellss[i].symbol = "X";
    }
  }
  else if(_symbol=="O"){
    //from higher edge to _row
    for(var i=higherEdge; i>_row-1; i--){
      this.figureMatrix.columns[_column].cellss[i].symbol = "O";
    }
  }
  else{
    //do nothing
    console.log("unexpedted _symbol in writeMergedCell: "+_symbol);
  }

  // console.log("writeMergedCell done.");

}

TradeSign = function(){
  this.sign="";
  this.row=0;
}



SnapShot.prototype.trade = function(_latestCandle){
  var columnID = this.figureMatrix.columns.length-1;
  var sign = new TradeSign();
  sign = this.checkFigureSign();

  if (this.figureMatrix.tradePosition.bs == ""){
    if(sign.sign == "Buy"){
      //entry(Buy)
      this.figureMatrix.tradePosition.entry(
        "Buy", this.time, columnID, sign.row, 
        marketData.candles[_latestCandle+1].mid.o);
      // this.figureMatrix.tradePosition.writePosition(
      //   this.time,
      //   columnID, 
      //   sign.row,
      //   "Buy",
      //   TRADE_AMOUNT, 
      //   marketData.candles[_latestCandle+1].mid.o);
      // console.log("ENTRY ",this.time, columnID,sign.row,"Buy",TRADE_AMOUNT, 
      //   marketData.candles[_latestCandle+1].mid.o);
    }
    else if (sign.sign == "Sell"){
      //entry(sell)
      this.figureMatrix.tradePosition.entry(
        "Sell", this.time, columnID, sign.row, 
        marketData.candles[_latestCandle+1].mid.o);

      // this.figureMatrix.tradePosition.writePosition(
      //   this.time,
      //   columnID, 
      //   sign.row,        
      //   "Sell",
      //   TRADE_AMOUNT, 
      //   marketData.candles[_latestCandle+1].mid.o);
      // console.log("ENTRY ",this.time,columnID,sign.row,"Sell",TRADE_AMOUNT, 
      //   marketData.candles[_latestCandle+1].mid.o);
      
    }
  }
  else if (this.figureMatrix.tradePosition.bs == "Buy"){
    if(sign.sign == "Sell"){
      //exit
      this.figureMatrix.tradePosition.exit(
        "Sell", this.time, columnID, sign.row, 
        marketData.candles[_latestCandle+1].mid.o);

      // this.figureMatrix.tradePosition.writePosition(
      //   this.time,
      //   columnID, 
      //   sign.row,
      //   "",
      //   TRADE_AMOUNT, 
      //   marketData.candles[_latestCandle+1].mid.o
      //   );
      // console.log("EXIT ",this.time,columnID,sign.row,"Sell",TRADE_AMOUNT, 
      //   marketData.candles[_latestCandle+1].mid.o);
    }
  }
  else if (this.figureMatrix.tradePosition.bs == "Sell"){
    if(sign.sign == "Buy"){
      //exit
      this.figureMatrix.tradePosition.exit(
        "Buy", this.time, columnID, sign.row, 
        marketData.candles[_latestCandle+1].mid.o);

      // this.figureMatrix.tradePosition.writePosition(
      //   this.time,
      //   columnID, 
      //   sign.row,
      //   "",
      //   TRADE_AMOUNT, 
      //   marketData.candles[_latestCandle+1].mid.o
      //   );
      // console.log("EXIT ",this.time,columnID,sign.row,"Buy",TRADE_AMOUNT, 
      //   marketData.candles[_latestCandle+1].mid.o);
    }
  }

}

SnapShot.prototype.checkFigureSign = function(){
  var sign = new TradeSign();
  var latestColumnID = this.figureMatrix.columns.length-1;
  var SecondPreviousColumnID = latestColumnID - 2;
  var latestEdgeRow = this.getLastRowNum(latestColumnID);
  var SecondPreviousEdgeRow = this.getLastRowNum(SecondPreviousColumnID);

  // Rule 1: Simple Rule
  // if O (down trend) 
  //   compare lowest rows: latest column and 2 columns before
  //   if latest column's row is lower than before 
  //     Sell sign is ON 
  if(this.trend == "Down"){
    if(latestEdgeRow < SecondPreviousEdgeRow){
      sign.sign = "Sell";
      sign.row = latestEdgeRow;
    }
  }

  // if X (up trend) 
  //   compare highest rows: latest column and 2 columns before
  //   if latest column's row is higher than before 
  //     Buy sign is ON 
  if(this.trend == "Up"){
    if(latestEdgeRow > SecondPreviousEdgeRow){
      sign.sign = "Buy";
      sign.row = latestEdgeRow;
    }
  }
  return sign;
}




//Main

function preload(){
  jsonPafiParameter = loadJSON('PafiParameter.json');
  jsonMarketData = loadJSON('USD_JPY_D.json');
}

function setup() {  

  console.log("Start PaFi!");
  
  //Generate Market Data
  marketData = new MarketData();
  marketData.initParam();
  console.log(marketData);

  //Generate TradeRecord
  var newRecord = new TradeRecord();
  newRecord.pair = "";
  newRecord.bs = "";
  newRecord.entryDate = "";
  newRecord.entryPrice = "";
  newRecord.amount = "";
  newRecord.exitDate = "";
  newRecord.exitPrice = "";
  newRecord.fee = "";
  newRecord.profitLoss = "";
  newRecord.balance = INITIAL_DEPOSIT;
  tradeRecords.push(newRecord);



  //FigureMatrix
  var snapshot = new SnapShot(marketData.candles[0].time);
  snapshot.generateFirstSnapShot();
  snapShots.push(snapshot);

  for(var i=1; i<marketData.candles.length; i++){
    var snapshot = new SnapShot(marketData.candles[i].time);
    snapshot.generateLatestSnapShot(i);
    snapShots.push(snapshot);
  }

  console.log(snapShots);
  console.log(tradeRecords);

  //Generate PaFi Canvas

  paFiCanvas = new PaFiCanvas();
  marketData.updateColumnNum();
  paFiCanvas.updateWidth();

  createCanvas(paFiCanvas.width, paFiCanvas.height); 
  background(10,10,10);
  frameRate(10);

}

function draw() {
  background(10,10,10);
  //frame
  paFiCanvas.drawframe();


  //if nPressed then refresh screen and wait for next keyPress
  //if sPressed then start automatic drawing 
  //if aPressed then draw snapshot of "aPressed"
  if (nPressed){
    aPressed = 0;
    sPressed = 0;
    nPressed = 0;
    snapIterator = 0;
  }
  else if (sPressed){
    //FigureMatrix
    if(snapIterator < marketData.candles.length){
    // if(snapIterator > debug_snapShotID-3 && snapIterator < debug_snapShotID+1){
      if(debug_snapIterator){console.log("===== "+snapIterator+" =====");}
        //SnapShot Date
      paFiCanvas.drawMatrix(snapIterator);
      paFiCanvas.drawSigns(snapIterator);
      paFiCanvas.drawLatestDate(snapIterator);
    }
    if(snapIterator < marketData.candles.length){
      snapIterator++;
    }
    else if (snapIterator == marketData.candles.length){
      console.log("Iteration done.");
    }    
  }
  else if (aPressed){
    paFiCanvas.drawMatrix(aPressed);
    paFiCanvas.drawSigns(aPressed);
    paFiCanvas.drawLatestDate(aPressed);
  }

}


function keyTyped(){
  console.log("keyTyped.",key);
  if(key == "a"){
    aPressed++;
  }
  else if (key == "n"){
    nPressed=1;
  }
  else if (key == "s"){
    sPressed=1;
  }

}

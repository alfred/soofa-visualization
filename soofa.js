$( document ).ready(function() {
  var foodAndDrinkURL = 'https://data.cityofboston.gov/resource/fdxy-gydq.json?';
  var liqURL = 'https://data.cityofboston.gov/resource/g9d9-7sj6.json?';
  var appToken = 'EdLXexUcLapLGwvyfe62eHoS8';
  
  var licCatMap = {
    'All Alcoholic' : ['CLBAL', 'CLBALA', 'CLBALV', 'CV7AL', 'CV7ALA', 'CV7ALN', 'CV7ALR', 'GOPAL', 'GOPALA', 'GOPALR', 'INNAL', 'INNALR', 'TAVAL'],
    'Wine and Malts Only' : ['CLBMW', 'CV7MW', 'CV7MWA', 'CV7MWL', 'CV7MWLR', 'CV7MWR', 'GOPMW', 'GOPMWL', 'INNMW'],
  };

  var foodAndDrinkFields = ['businessname', 'address', 'zip', 'licstatus', 'licenseadddttm', 'dayphn'];
  var liqFields = ['address', 'dbaname', 'businessname','opening', 'closing', 'expdttm', 'issdttm', 'licstatus', 'liccat', 'zip', 'city'];

  var foodAndDrinkMasterData = [];
  var liquorMasterData = [];
  var combinedMaster = [];
  var filteredFoodAndDrink = [];
  var filteredLiquor = [];
  var $licenseBody = $('.licenses.col-md-9 > .row');

  var foodRequest = $.ajax({
    url : foodAndDrinkURL + '$select=' + foodAndDrinkFields.join(',') + '&$limit=50000',
    headers : {
      'X-App-Token' : 'EdLXexUcLapLGwvyfe62eHoS8'
    },
    method : 'GET'
  });

  var liquorRequest = $.ajax({
    url : liqURL + '$select=' + liqFields.join(',') + '&$limit=50000',
    headers : {
      'X-App-Token' : 'EdLXexUcLapLGwvyfe62eHoS8'
    },
    method : 'GET'
  });

  $('#datepicker').datepicker()
    .on('changeDate', function(e) {
      readFilters();
    });
  // Set the date to today.

  // Wouldn't do this for massive datasets, pagination is optimization though
  Q.all([
    foodRequest,
    liquorRequest
    ]).then(function(results) {
      
      foodAndDrinkMasterData = results[0];
      filteredFoodAndDrink = foodAndDrinkMasterData;
      liquorMasterData = results[1];
      
      _.each(liquorMasterData, function(liqLic) {
        // This runs slow as hell, should be sort + binary search
        var possibleMatch = _.find(foodAndDrinkMasterData, function(foodPlace) {
          return matchLiquorAndFood(liqLic, foodPlace);
        });
        if (possibleMatch !== undefined) {
          var combined = combineLiquorAndFood(liqLic, possibleMatch);
          this.push(combined)
          filteredFoodAndDrink.splice(_.indexOf(possibleMatch), 1)
        } else {
          filteredLiquor.push(liqLic);
        }
      }, combinedMaster);

      console.log(_.size(combinedMaster));
      console.log(_.size(filteredLiquor));
      console.log(_.size(filteredFoodAndDrink));
    });

    var combineLiquorAndFood = function(liqour, food) {
      var combinedResult = {
        address : liqour.address,
        businessname : food.businessname,
        city : liqour.city,
        zip : liqour.city,
        foodLicStatus : food.licstatus,
        licenseadddttm : food.licenseadddttm,
        dayphn : food.dayphn,
        liquorLicStatus : liqour.licstatus,
        expdttm : liqour.expdttm,
        issdttm : liqour.issdttm,
        liccat : liqour.liccat
      };

      return combinedResult;
    }

    var matchLiquorAndFood = function (liq, food) {
      return ((liq.dbaname.toLowerCase() == food.businessname.toLowerCase()) &&
            (liq.zip == food.zip));
    }

    var readFilters = function() {
      var selectedType = $('#license-type-filter').find(':selected').text();
      switch (selectedType) {
        case 'Food Only':
          clearBoard();
          render(filteredFoodAndDrink, 'food');
          break;
        case 'Liquor Only':
          clearBoard();
          render(filteredLiquor, 'liq');
          break;
        default:
          clearBoard();
          render(combinedMaster, 'both');
          render(filteredFoodAndDrink, 'food');
          render(filteredLiquor, 'liq');
      }
    };

    var clearBoard = function() {
      _.each($('.licenses.col-md-9 > .row').children('.col-md-4'), function($panelElm) {
        $panelElm.remove();
      });
      console.log("Shit Removed");
    }
    var render = function(array, type) {
      _.each(array, function(store) {
        switch(type) {
          case 'food':
            drawFood(store);
            break;
          case 'liq':
            drawLiquor(store);
            break;
          case 'both':
            drawCombo(store);
            break;
          default:
            console.err("This error should never come up, maybe use if here.");
        }
      });
    };

    var drawFood = function(foodPlace) {
      var selectedDate = new Date($('#datepicker').datepicker('getDate'));
      var selectedDateMap = {
        year : selectedDate.getYear() + 1900,
        month : selectedDate.getMonth() + 1,
        day : selectedDate.getDate()
      };

      var placeDateUnFormatted = foodPlace.licenseadddttm.substring(0, 10);
      var placeDateMap = {
        year : parseInt(placeDateUnFormatted.substring(0, 4)),
        month : parseInt(placeDateUnFormatted.substring(5, 7)),
        day : parseInt(placeDateUnFormatted.substring(8, 10))
      };

      var isLicensed = hasActiveFoodLicense(placeDateMap, selectedDateMap);
      var licensedGlyph = (isLicensed) ? 'ok' : 'remove';

      var $panelElement = $('<div class="col-md-4"><div class="panel panel-default">'
        + '<div class="panel-heading"><h3 class="panel-title">' + foodPlace.businessname 
        + '</h3></div><div class="panel-body"><address>' + foodPlace.address
        + '<br/>' + foodPlace.city + ', MA ' + foodPlace.zip
        + '<br/></address>Food License? <span class="glyphicon glyphicon-' + licensedGlyph
        + '" aria-hidden="true"></span><p class="license-date">Issued on: <span aria-hidden="true">'
        + placeDateMap.month + '-' + placeDateMap.day + '-' + placeDateMap.year + '</span></p>'
        + '</div></div></div>');
      $licenseBody.append($panelElement);
    };

    var drawLiquor = function(liqPlace) {
      var selectedDate = new Date($('#datepicker').datepicker('getDate'));
      var selectedDateMap = {
        year : selectedDate.getYear() + 1900,
        month : selectedDate.getMonth() + 1,
        day : selectedDate.getDate()
      };

      var placeStartDateUnFormatted = liqPlace.issdttm.substring(0, 10);
      var placeStartDateMap = {
        year : parseInt(placeStartDateUnFormatted.substring(0, 4)),
        month : parseInt(placeStartDateUnFormatted.substring(5, 7)),
        day : parseInt(placeStartDateUnFormatted.substring(8, 10))
      };

      var placeEndDateUnFormatted = liqPlace.expdttm.substring(0, 10);
      var placeEndDateMap = {
        year : parseInt(placeEndDateUnFormatted.substring(0, 4)),
        month : parseInt(placeEndDateUnFormatted.substring(5, 7)),
        day : parseInt(placeEndDateUnFormatted.substring(8, 10))
      };

      var isLicensed = hasActiveLiquorLicense(placeStartDateMap, selectedDateMap, placeEndDateMap);
      var menuSelections = getMenuSelection(liqPlace.liccat);

      var $panelElement = $('<div class="col-md-4"><div class="panel panel-default">'
        + '<div class="panel-heading"><h3 class="panel-title">' + liqPlace.businessname 
        + '</h3></div><div class="panel-body"><address>' + liqPlace.address
        + '<br/>' + liqPlace.city + ', MA ' + liqPlace.zip + '<br/></address>'
        + menuSelections + '<p class="license-date">Issued on: <span aria-hidden="true">'
        + placeStartDateMap.month + '-' + placeStartDateMap.day + '-' + placeStartDateMap.year
        + '</span></p><p class="license-date">Expires on: <span aria-hidden="true">'
        + placeEndDateMap.month + '-' + placeEndDateMap.day + '-' + placeEndDateMap.year
        + '</span></p></div></div></div>');
      $licenseBody.append($panelElement);
    };

    var hasActiveFoodLicense = function(placeDateMap, currentDateMap) {
      return ((placeDateMap.year < currentDateMap.year) ||
        ((placeDateMap.year === currentDateMap.year) && (placeDateMap.month < currentDateMap.month)) ||
        ((placeDateMap.year === currentDateMap.year) && (placeDateMap.month === currentDateMap.month) && (placeDateMap.day < currentDateMap.day)));
    };

    var hasActiveLiquorLicense = function(startDateMap, currentDateMap, endDateMap) {
      return (((startDateMap.year < currentDateMap.year) && (endDateMap.year > currentDateMap.year)) ||
        ((startDateMap.year === currentDateMap.year) && (endDateMap.year >= currentDateMap.year) && (startDateMap.month < currentDateMap.month)) ||
        ((startDateMap.year === currentDateMap.year) && (endDateMap.year === currentDateMap.year) && (startDateMap.month <= currentDateMap.month) && (expMonth >= currentDateMap.month)) ||
        ((startDateMap.year === currentDateMap.year) && (endDateMap.year === currentDateMap.year) && (startDateMap.month === currentDateMap.month) && (expMonth >= currentDateMap.month)) ||
        ((startDateMap.year === currentDateMap.year) && (endDateMap.year === currentDateMap.year) && (startDateMap.month === currentDateMap.month) && (expMonth === currentDateMap.month) && (startDateMap.day <= currentDateMap.day) && (endDateMap.day >= currentDateMap.day)));
    }

    var getMenuSelection = function(licCat) {
      if(_.contains(licCatMap['All Alcoholic'], licCat)) {
        return 'All Alcoholic Beverages';
      } else if(_.contains(licCatMap['Wine and Malts Only'], licCat)) {
        return 'Wine and Malts Only';
      }
    }

});
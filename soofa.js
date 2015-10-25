$( document ).ready(function() {
  var foodAndDrinkURL = 'https://data.cityofboston.gov/resource/fdxy-gydq.json?';
  var liqURL = 'https://data.cityofboston.gov/resource/g9d9-7sj6.json?';
  var appToken = 'EdLXexUcLapLGwvyfe62eHoS8';
  
  var licCatMap = {
    'All Alcoholic' : ['CLBAL', 'CLBALA', 'CLBALV', 'CV7AL', 'CV7ALA', 'CV7ALN', 'CV7ALR', 'GOPAL', 'GOPALA', 'GOPALR', 'INNAL', 'INNALR', 'TAVAL'],
    'Wine and Malts Only' : ['CLBMW', 'CV7MW', 'CV7MWA', 'CV7MWL', 'CV7MWLR', 'CV7MWR', 'GOPMW', 'GOPMWL', 'INNMW'],
  };

  var foodAndDrinkFields = ['businessname', 'address', 'zip', 'licstatus', 'licenseadddttm', 'dayphn'];
  var liqFields = ['address', 'dbaname', 'businessname', 'comments','opening', 'closing', 'expdttm', 'issdttm', 'licstatus', 'liccat', 'zip'];

  var foodAndDrinkMasterData = [];
  var liquorMasterData = [];
  var combinedMaster = [];
  var filteredFoodAndDrink = [];
  var filteredLiquor = [];

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

  $('#datepicker').datepicker();
  // Set the date to today.
  $('#dateipicker').on("changeDate", function() {
      $('#my_hidden_input').val(
          console.log$('#datepicker').datepicker('getFormattedDate')
      );
  });

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
            (liq.zip == food.zip) && (liq.city == food.city));
    }

    var readFilters = function() {
      switch (selectedType) {
        case 'Food Only':
          render(filteredFoodAndDrink, 'food');
          break;
        case 'Liquor Only':
          render(filteredLiquor, 'liq');
          break;
        default:
          render(combinedMaster, 'both');
          render(filteredFoodAndDrink, 'food');
          render(filteredLiquor, 'liq');
      }
    };

    var render = function(array, type) {
      _.each(array, function(store) {
        switch(type {
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
        })
      });
    };

    var drawFood = function(foodPlace) {
      var $licenseBody = $('.licenses.col-md-9 > .row');
      var selectedType = $('#license-type-filter').find(':selected').text();
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
      var licensedGlyph = if (isLicensed) ? 'ok' : 'remove';

      var $panelElement = $('<div class="col-md-4"><div class="panel panel-default">'
        + '<div class="panel-heading"><h3 class="panel-title">' + foodPlace.businessname 
        + '</h3></div><div class="panel-body"><address>' + foodPlace.address
        + '<br/>' + foodPlace.city + ', MA ' + foodPlace.zip
        + '<br/></address>Food License? <span class="glyphicon glyphicon-' + licensedGlyph
        + '" aria-hidden="true"></span><p class="license-date">Issued on: <span aria-hidden="true">'
        + placeDateMap.month + '-' placeDateMap.day + '-' placeDateMap.year + '</span></p>'
        + '</div></div></div>');
    };

    var hasActiveFoodLicense = function(placeDateMap, currentDateMap) {
      return ((placeDateMap.year < currentDateMap.year) ||
        ((placeDateMap.year === currentDateMap.year) && (placeDateMap.month < currentDateMap.month)) ||
        ((placeDateMap.year === currentDateMap.year) && (placeDateMap.month === currentDateMap.month) && (placeDateMap.day < currentDateMap.day)));
    };


});
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
        businessname : liqour.businessname,
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
});
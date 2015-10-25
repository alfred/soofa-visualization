$( document ).ready(function() {
  var foodAndDrinkURL = 'https://data.cityofboston.gov/resource/fdxy-gydq.json?';
  var liqURL = 'https://data.cityofboston.gov/resource/g9d9-7sj6.json?';
  var appToken = 'EdLXexUcLapLGwvyfe62eHoS8';
  
  var licCatMap = {
    'All Alcoholic' : ['CLBAL', 'CLBALA', 'CLBALV', 'CV7AL', 'CV7ALA', 'CV7ALN', 'CV7ALR', 'GOPAL', 'GOPALA', 'GOPALR', 'INNAL', 'INNALR', 'TAVAL'],
    'Wine and Malts Only' : ['CLBMW', 'CV7MW', 'CV7MWA', 'CV7MWL', 'CV7MWLR', 'CV7MWR', 'GOPMW', 'GOPMWL', 'INNMW'],
  };

  var foodAndDrinkFields = ['businessname', 'address', 'zip', 'licstatus', 'licenseadddttm', 'dayphn'];
  var liqFields = ['address', 'businessname', 'comments','opening', 'closing', 'expdttm', 'issdttm', 'licstatus', 'liccat', 'zip'];

  var foodAndDrinkMasterData = [];
  var liquorMasterData = [];

  $.ajax({
    url : foodAndDrinkURL + '$select=' + foodAndDrinkFields.join(',') + '&$limit=50000',
    headers : {
      'X-App-Token' : 'EdLXexUcLapLGwvyfe62eHoS8'
    },
    method : 'GET',

  }).done(function(data) {
    // foodAndDrinkMasterData = data;
    console.log('Food: ' + data.length);
  });

  $.ajax({
    url : liqURL + '$select=' + liqFields.join(',') + '&$limit=50000',
    headers : {
      'X-App-Token' : 'EdLXexUcLapLGwvyfe62eHoS8'
    },
    method : 'GET'
  }).done(function(data) {
    console.log('Liquor: ' + data.length);
  });
    // console.log( "ready!" );

    // var newArray = _.map(array, function(number) {
    //   return number * 2;
    // });

});
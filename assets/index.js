var app={};

function getNearest(){
	var data={
		loc : app.coords
	};
	var url="/customer/nearest";
	$.get(url,data).done(function(customers){
		var customerNamesCommaSeperated = customers.map(function(c){
			return c.name;
		}).join();
		$("#closestCustomer").text(customerNamesCommaSeperated);
	});	
};
function createCustomersDropDown(customers){
	customers.forEach(function(cust){
		$("#customers")
			.append($('<option>', { value : cust.name })
          	.text(cust.name)); 
	});
};
function initCustomersDropDown(){
	$("#customers").change(function(){
		var el=$(this);
		var val =el.val();
		if(!val || !app.coords)
			return;
		var customer=customers[val];
		var data={
			loc1:customer,
			loc2 : app.coords
		};
		var url="/location/diff";
		$.get(url,data).done(function(diff){
			$("#distance").text(Math.round(diff* 100) / 100)
		});
	});	
};

function showInMaps(position){
	
	var mapcanvas = document.createElement('div');
  mapcanvas.id = 'mapcanvas';
  mapcanvas.style.height = '400px';
  mapcanvas.style.width = '560px';
    
  document.querySelector('article').appendChild(mapcanvas);
  
  var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var myOptions = {
    zoom: 15,
    center: latlng,
    mapTypeControl: false,
    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);
  
  var marker = new google.maps.Marker({
      position: latlng, 
      map: map, 
      title:"You are here! (at least within a "+position.coords.accuracy+" meter radius)"
  });
};

function showTimePassed(arrivedAt){	
	app.arrivedAt = arrivedAt;
	$('#arrivedAt').text(arrivedAt.toLocaleDateString() + ' om ' + arrivedAt.toLocaleTimeString());

	window.setInterval(function(){
		var now = new Date(),
			duration = now - app.arrivedAt; //difference in milliseconds

		$('#timePassed').text(msToTime(duration));
				
	}, 10000);	
}

function msToTime(duration) {
   var seconds = parseInt((duration/1000)%60), 
	  minutes = parseInt((duration/(1000*60))%60),
	  hours = parseInt((duration/(1000*60*60))%24);

    return hours + ' uren ' + minutes + ' minuten ' + seconds + ' seconden ';
}

function success(position) {
	app.coords=position.coords;
	showInMaps(position);
	getNearest();
	showTimePassed(new Date());
}

function error(msg) {
   console.log(arguments);
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(success, error);
} else {
  error('not supported');
}

var customers={
	SD:{latitude: 51.226956, longitude: 4.401744},
	ACERTA:{latitude:50.882657,longitude: 4.713809}
};
	$(function(){

		$.get("/customer/getAll").done(function(customers){
			if(!customers || !customers.length){
				alert("nog geen testdata. Klik on generate en refresh pagina");
				return;
			}
			createCustomersDropDown(customers);
			initCustomersDropDown();		
		});
	})

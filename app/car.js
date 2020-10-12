function saveCar(event) {
	event.preventDefault();
	
	const car = getFormData($('#carForm'));

	if (car.id != "") {
		updateCar(car);
	} else {
		addCar(car);
	}
}

function addCar(car) {
	$.ajax({
		url: 'http://localhost:8080/veiculos/',
		type: 'POST',
		data: JSON.stringify(car),
		contentType: 'application/json',
		success: function() {
			toastr["success"]("Car saved successfully!")
			clearForm();
			reloadMainFunctions();
		}
	});
}

function updateCar(car) {
	$.ajax({
		url: 'http://localhost:8080/veiculos/' + car.id,
		type: 'PUT',
		contentType: 'application/json',
		data: JSON.stringify(car),
		success: function() {
			toastr["success"]("Car saved successfully!")
			clearForm();
			reloadMainFunctions();
		}
	})
}

function deleteCar(id) {
	$.ajax({
		url: 'http://localhost:8080/veiculos/' + id,
		type: 'DELETE',
		success: function() {
			toastr["success"]("Car deleted successfully!")
			reloadMainFunctions();
		}
	})
}

function modifyCar(id) {
	$.ajax({
		url: 'http://localhost:8080/veiculos/' + id,
		type: 'GET',
		dataType: 'json',
		success: function(response) {
			fillFormWithCar(response);
		}
	})
}

function getAllCars() {
	$.ajax({
		url: 'http://localhost:8080/veiculos/',
		type: 'GET',
		success: function(carList) {
			getCarsByDecade(carList);
			printNotSoldQty(carList);
			printQtyThisWeek(carList);
			printBrandQty(carList, 'CHEVROLET', 'chevroletQty');
			printBrandQty(carList, 'FIAT', 'fiatQty');
			printBrandQty(carList, 'FORD',  'fordQty');
			printBrandQty(carList, 'HYUNDAI', 'hyundaiQty');
			printBrandQty(carList, 'JEEP', 'jeepQty');
			printBrandQty(carList, 'RENAULT',  'renaultQty');
			printBrandQty(carList, 'TOYOTA',  'toyotaQty');
			printBrandQty(carList, 'VOLKSWAGEN',  'volkswagenQty');
			initializeDataTable(carList);
		}
	});
};

function getNotSoldCars(carList) {
	return carList.filter(
		function(car) {
			return car.sold == false;
		}
	).length;
}

function getLastWeekRegisteredCars(carList) {
	return carList.filter(
		function(car) {
			return moment(car.created).subtract(1,  'week');
		}).length;
}

function getCarsByBrand(carList, brand) {
	return carList.filter(
		function(car)  {
			return car.brand == brand;
		}
	).length;
}

function getCarsByDecade(carList) {
	let formattedDates = [];
	let decades = {};

	const distinct = (value, index, self) => {
		return self.indexOf(value) === index;
	}

	carList.forEach(car => {
		formattedDates.push(getDecade((car.year)));
	});

	formattedDates.sort();

	formattedDates.forEach(function(decade) {
		decades[decade] = (decades[decade] || 0) + 1;
	});

	printCarsByDecade(decades);

}

function printCarsByDecade(decades) {
	let html = 'Registered in database:<br>';
	for (decade in decades) {
		html += '    <b>' + decade + '</b>: ' + decades[decade] + '<br>';
	}

	$('#carByDecade').html(html);
}

function printQtyThisWeek(carList) {
	$('#thisWeek').html(getLastWeekRegisteredCars(carList));
}

function printNotSoldQty(carList) {
	$('#notSold').html(getNotSoldCars(carList));
}

function printBrandQty(carList, brand, id) {
	$('#' + id).html(getCarsByBrand(carList, brand));
}

function initializeDataTable(carList) {
	let html = '';

	carList.forEach(car => {
		html += '<tr>';
		html += '   <td align="center"><i class="fas fa-times" style="cursor: pointer;" onclick="deleteCar(' + car.id + ');">' +
			'</i>&nbsp;&nbsp;<i class="fas fa-pencil-alt" style="cursor: pointer;" onclick="modifyCar(' + car.id + ');"></i></td>';
		html += '   <td>' + car.model + '</td>';
		html += '   <td>' + car.brand + '</td>';
		html += '   <td>' + car.year + '</td>';
		html += '   <td>' + replaceNullForEmptyString(car.description) + '</td>';
		html += '   <td>' + car.sold + '</td>';
		html += '   <td>' + formatDateToDDMMYYYY(replaceNullForEmptyString(car.created)) + '</td>';
		html += '   <td>' + formatDateToDDMMYYYY(replaceNullForEmptyString(car.updated)) + '</td>';
		html += '</tr>';
	});

	$('#carTable tbody').html(html);

	$('#carTable').DataTable();
}

function reloadMainFunctions() {
	getAllCars();
}

$('document').ready(function() {
	reloadMainFunctions();
});

function formatDateToDDMMYYYY(inputFormat) {
	if  (inputFormat === "") {
		return inputFormat;
	}
	function pad(s) {
		return (s < 10) ? '0' + s : s;
	}
	let d = new Date(inputFormat);
	return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
}

function replaceNullForEmptyString(object) {
	return (object != null) ? object : "";
}

function getFormData($form) {
	var unindexed_array = $form.serializeArray();
	var indexed_array = {};

	$.map(unindexed_array, function(n, i) {
		indexed_array[n['name']] = n['value'];
	});

	return indexed_array;
}

function getDecade(year) {
	const date = new Date(year, 01, 01);
	return (Math.floor(date.getFullYear() / 10) * 10) + 's';
}

function fillFormWithCar(car) {
	$('#carId').val(car.id);
	$('#selectBrand').val(car.brand);
	$('#carModel').val(car.model);
	$('#carDescription').val(car.description);
	$('#year').val(car.year);
	$('#selectStatus').val(car.sold.toString());
}

function clearForm() {
	$('#carForm')[0].reset();
}
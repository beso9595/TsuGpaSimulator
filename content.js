/*
v1.0
*/

var originalGPA = document.getElementById("ctl00_C1_SumGPA").innerHTML;
var subjectArray = Get_rowCapacity();   //იძახებს   1)Get_apResult;   2)Check_apResult;    3)Get_rowNumber;    ფუნქციებს
var subjectAmount = subjectArray.length;
var trNumberArray = Get_trNumberArray();
var pointArray = Get_pointArray();
var creditArray = Get_creditArray();
Add_cells();
var indexArray = Convert_pointToIndex();
Set_cells();
Count_gpa();

var semesterArray = Get_semesterArray();
Count_average(0);
Add_averageCell();

//აგენერირებს "აპელაციის შედეგების" id-ის
function Get_apResult(num) {
    var zero = "0";
    if (num > 9) {
        zero = "";
    }
    var str = "ctl00_C1_GridView1_ctl" + zero + num + "_HyperLink1";
    return str;
}

//ამოწმებს "აპელაციის შედეგების" id არსებობს თუ არა
function Check_apResult(apResult) {
    apResult = document.getElementById(apResult);
    if (apResult == null) {
        return false;
    }
    return true;
}

//აბრუნებს საგნის ნომერს ცხრილიდან
function Get_rowNumber(idNum) {
    var zero = "0";
    if (idNum > 9) {
        zero = "";
    }
    var rowId = "ctl00_C1_GridView1_ctl" + zero + idNum + "_CountLabel";
    var rowOb = document.getElementById(rowId);
    var rowNumber = rowOb.innerHTML;
    return rowNumber;
}

//აბრუნებს საგნების რაოდენობას
function Get_rowCapacity() {
    var rowId = 2;
    var subjectArray = new Array();
    while (true) {
        var subjectNum;
        var apResult = Get_apResult(rowId);
        if (Check_apResult(apResult)) {
            subjectNum = Get_rowNumber(rowId);
        }
        else {
            return subjectArray;
        }
        subjectArray[rowId - 2] = subjectNum;
        rowId++;
    }
}

//ააწყობს tr-ების ნუმერაციის მასივს   subjectArrayLength
function Get_trNumberArray() {
    var trNumberArray = new Array();
    var num = 1;
    trNumberArray[0] = num;
    for (var i = 1; i < subjectArray.length; i++) {
        trNumberArray[i] = (num += 3);
    }
    return trNumberArray;
}

//შეინახავს pointArray-ში ქულებს
function Get_pointArray() {
    var pointArray = new Array();
    var tableId = document.getElementById("ctl00_C1_GridView1");
    var getTbody = tableId.getElementsByTagName("tbody")[0]; //0 1 2 3  4  5  6  7  8  9  10 11 12 13 14 15  index
    for (var i = 0; i < subjectArray.length; i++) {
        var getTr = getTbody.getElementsByTagName("tr")[trNumberArray[i]];   //1 4 7 10 13 16 19 22 25 28 31 34 37 40 43 46  tr
        var getTd = getTr.getElementsByTagName("td")[15];
        pointArray[i] = getTd.innerHTML;
    }
    return pointArray;
}

//შეინახავს creditArray-ში კრედიტებს
function Get_creditArray() {
    var creditArray = new Array();
    var tableId = document.getElementById("ctl00_C1_GridView1");
    var getTbody = tableId.getElementsByTagName("tbody")[0]; //0 1 2 3  4  5  6  7  8  9  10 11 12 13 14 15  index
    for (var i = 0; i < subjectArray.length; i++) {
        var getTr = getTbody.getElementsByTagName("tr")[trNumberArray[i]];   //1 4 7 10 13 16 19 22 25 28 31 34 37 40 43 46  tr
        var getTd = getTr.getElementsByTagName("td")[16];
        creditArray[i] = getTd.innerHTML;
    }
    return creditArray;
}

//ამატებს ცხრილის მარჯვნივ სამანიპულაციო ხელსაწყოებს
function Add_cells() {
    var selectorIndex = 0;
    var setterIndex = 0;
    var getTable = document.getElementById("ctl00_C1_GridView1");
    var getTbody = getTable.getElementsByTagName("tbody")[0];   //0 1 2 3  4  5  6  7  8  9  10 11 12 13 14 15  index
    var getRow = getTbody.getElementsByTagName("tr")[0];
	var SetAll = document.createElement("button");
	SetAll.textContent = "set";
	SetAll.id = "setter0";
	SetAll.type = "button";
	SetAll.addEventListener("click", function () {
	    Set_all();
	    for (var i = 1; i <= subjectAmount; i++) {
	        Count_gpa("selector" + i);
	    }
	});
	getRow.insertCell(-1).appendChild(SetAll);
    var selectList = ["--", "A", "B", "C", "D", "E", "F"];
    //
    for (var i = 0; i < subjectArray.length; i++) {
        getRow = getTbody.getElementsByTagName("tr")[trNumberArray[i]];   //1 4 7 10 13 16 19 22 25 28 31 34 37 40 43 46  tr
        selectorIndex = setterIndex = subjectArray[i];
        //
        var setSign = document.createElement("select");
        setSign.id = "selector" + selectorIndex;
        setSign.addEventListener("change", function () {
            Change_gpa(this.id);
			
        });
        getRow.insertCell(-1).appendChild(setSign);
        for (var j = 0; j < selectList.length; j++) {
            var opt = document.createElement("option");
            opt.value = selectList[j];
            opt.text = selectList[j];
            setSign.appendChild(opt);
        }
        //
        var setButton = document.createElement("button");
        setButton.textContent = "set";
        setButton.id = "setter" + setterIndex;
        setButton.type = "button";
        setButton.addEventListener("click", function () {
            Set_one(this.id);
			Count_gpa(this.id.replace("setter", "selector"));
        });
        getRow.insertCell(-1).appendChild(setButton);

    }
}

//ამოწმებს საგანი გაუვლელია თუ ჩაუბარებელი
function Check_nullOrFail(ind) {
            
    if (pointArray[ind] > 0) {
        return false;
    }	
    var tableId = document.getElementById("ctl00_C1_GridView1");
    var getTbody = tableId.getElementsByTagName("tbody")[0];
    var getTr = getTbody.getElementsByTagName("tr")[trNumberArray[ind]];   //1 4 7 10 13 16 19 22 25 28 31 34 37 40 43 46  tr
	//
	var semester = (getTr.getElementsByTagName("td")[17]).innerHTML;
	var studyYears = (getTr.getElementsByTagName("td")[19]).innerHTML;
	
	var currentDate = new Date();
	var currentYear = currentDate.getFullYear();	//2015
	var currentMonthIndex = currentDate.getMonth();	//3(+1)
	
	var year = (currentYear).toString().slice(2,4);
	
    if(semester % 2 == 1){		//autumn
		if(studyYears.match(year + "-") != null){
			if(currentMonthIndex > 7 || currentMonthIndex < 2){
				return true;
			}
			else{
				return false;
			}
		}
		else{
			return false;
		}
	}
	else{						//spring
		if(studyYears.match("-" + year) != null){
			if(currentMonthIndex > 1 && currentMonthIndex < 7){
				return true;
			}
			else{
				return false;
			}
		}
		else{
			return false;
		}
	}    
            
}

//ქულების მიხედვით ანიჭებს ინდექს რომლითაც დავაკონფიგურირებთ <select> ტეგს
function Convert_pointToIndex() {
    var indexArray = new Array();
    for (var i = 0; i < pointArray.length; i++) {
        if (pointArray[i] > 90) {
            indexArray[i] = 1;
            continue;
        }
        if (pointArray[i] > 80) {
            indexArray[i] = 2;
            continue;
        }
        if (pointArray[i] > 70) {
            indexArray[i] = 3;
            continue;
        }
        if (pointArray[i] > 60) {
            indexArray[i] = 4;
            continue;
        }
        if (pointArray[i] > 50) {
            indexArray[i] = 5;
            continue;
        }
                
        var bl = true;
        bl = Check_nullOrFail(i);
        if (bl) {
            indexArray[i] = 0;
            continue;
        }

        indexArray[i] = 6;
        continue;
    }
    return indexArray;
}

//სვავს შესაბამის კატეგორიებს (A, B, C, D, E ან F), ასევე -- თუ საგანს სტუდენტი მიმდინარე სემესტრში გადის
function Set_cells() {
    for (var i = 0; i < indexArray.length; i++) {
        document.getElementById("selector" + (i+1)).selectedIndex = indexArray[i];
    }
}

//სვავს შესაბამის <select> ტეგში თავდაპირველ(ნამდვილ) მნიშვნელობას
function Set_one(btnId) {
    var selectorId = btnId.replace("setter", "");
    var slctrId = "selector" + selectorId;
            
    var tableId = document.getElementById("ctl00_C1_GridView1");
    var getTbody = tableId.getElementsByTagName("tbody")[0]; //0 1 2 3  4  5  6  7  8  9  10 11 12 13 14 15  index
    var getTr = getTbody.getElementsByTagName("tr")[((selectorId - 1) * 3) + 1];   //1 4 7 10 13 16 19 22 25 28 31 34 37 40 43 46  tr
    var getTd = getTr.getElementsByTagName("td")[15];    //1 2 3 4  5  6  7  8  9  10 11
    var point = parseInt(getTd.innerHTML);
            
    if (point > 90) {
        document.getElementById(slctrId).selectedIndex = 1;
        return 1;
    }
    if (point > 80) {
        document.getElementById(slctrId).selectedIndex = 2;
        return 2;
    }
    if (point > 70) {
        document.getElementById(slctrId).selectedIndex = 3;
        return 3;
    }
    if (point > 60) {
        document.getElementById(slctrId).selectedIndex = 4;
        return 4;
    }
    if (point > 50) {
        document.getElementById(slctrId).selectedIndex = 5;
        return 5;
    }
    if (point > 0) {
        document.getElementById(slctrId).selectedIndex = 6;
        return 6;
    }
    var bl = Check_nullOrFail(parseInt(selectorId)-1);
            
    if (bl) {
        document.getElementById(slctrId).selectedIndex = 0;
		return 0;
    }
    else {
        document.getElementById(slctrId).selectedIndex = 6;
		return 6;
    }
}

//სვავს ყველა <select> ტეგში თავდაპირველ(ნამდვილ) მნიშვნელობას
function Set_all() {
    var count = 1;
    var str = "setter";
    while (true) {
       var id = str + count;
                
       if (document.getElementById(id) != null) {
           Set_one(id);
       }
       else {
           break;
       }
	   count++;
    }
    Set_gpaColor();
}

//აბრუნებს ქულების შესაბამის GPA-ების მასივს
function Count_gpa(rowId) {
            
    if (rowId != undefined) {    //rowId - selector1; selectorId - 0,1,2,3,4,5,6
        var selectorId = document.getElementById(rowId).selectedIndex;
        var ind = rowId.replace("selector", "");
        indexArray[ind-1] = selectorId;
    }
    var gpaArray = new Array();
    for (var i = 0; i < indexArray.length; i++) {
        switch (indexArray[i]) {
            case 1:
                gpaArray[i] = 4;
                break;
            case 2:
                gpaArray[i] = 3;
                break;
            case 3:
                gpaArray[i] = 2;
                break;
            case 4:
                gpaArray[i] = 1;
                break;
            case 5:
                gpaArray[i] = 0.5;
                break;
            case 0:
                gpaArray[i] = 0;
                break;
            case 6:
                gpaArray[i] = 0;
                break;
        }
    }
    Get_gpa(gpaArray);
}

//ითვლის საბოლოო GPA-ს
function Get_gpa(gpaArray) {
    var gpaAndCredit = new Array();
    var sum = 0;
    var creditSum = 0;
    for (var i = 0; i < gpaArray.length; i++) {
        gpaAndCredit[i] = gpaArray[i] * creditArray[i];
    }
    for (var i = 0; i < gpaAndCredit.length; i++) {
        sum += gpaAndCredit[i];
    }
    for (var i = 0; i < gpaAndCredit.length; i++) {
        if (gpaAndCredit[i] != 0) {
            creditSum += parseInt(creditArray[i]);
        }
    }
    var all = sum / creditSum;
    Print_gpa(all);
}

//ადგენს ფერს GPA მაჩვენებლისთვის
function Set_gpaColor(){
	var gpaId = document.getElementById("ctl00_C1_SumGPA");
	var gpa = gpaId.innerHTML;
	if(gpa >= 3.5){
		gpaId.style.color = "#26920B";
		return 0;
	}
    if(gpa >= 3.0){
		gpaId.style.color = "#0072bc";
		return 0;
	}
	if(gpa >= 2.5){
		gpaId.style.color = "#FF6600";
		return 0;
	}
	gpaId.style.color = "red";
}

//ცვლის GPA მაჩვენებელს
function Print_gpa(gpa) {
    var fixedGpa = parseFloat(gpa).toFixed(14);
	var gpaId = document.getElementById("ctl00_C1_SumGPA");
	gpaId.innerHTML = fixedGpa;
	Set_gpaColor();
}

//ცვლილება
function Change_gpa(rowId) {
    Count_gpa(rowId);
}
        
//1) ვიგებთ რამდენია ქულების შესაბამისი გპა კოეფიციენტი
//2) თითოეულის კოეფიციენტი მრავლდება მის კრედიტზე
//3) ეს ნამრავლები შევაჯამოთ
//4) შევაჯამოთ კრედიტები
//5) 3) / 4) = გპა


//აბრუნებს სემესტრების მასივს 111222333444..
function Get_semesterArray(){
	
	var semesterArray = new Array();
    var tableId = document.getElementById("ctl00_C1_GridView1");
    var getTbody = tableId.getElementsByTagName("tbody")[0]; //0 1 2 3  4  5  6  7  8  9  10 11 12 13 14 15  index
    for (var i = 0; i < subjectArray.length; i++) {
        var getTr = getTbody.getElementsByTagName("tr")[trNumberArray[i]];   //1 4 7 10 13 16 19 22 25 28 31 34 37 40 43 46  tr
        var getTd = getTr.getElementsByTagName("td")[17];
        semesterArray[i] = getTd.innerHTML;
    }
	return semesterArray;
}

//ითვლის ქულათა საშუალოს სემესტრის ან მთლიანად ბაკალავრიატის მიხედვით
function Count_average(sem){
	var j = 0;
	var sum = 0;
	var ave;
	if(sem == 0){
		for(var i = 0; i < pointArray.length; i++){
		    if (pointArray[i] > 50) {
				j++;
				sum += parseInt(pointArray[i]);
			}
		}
	}
	else{
		for(var i = 0; i < semesterArray.length; i++){
			if(semesterArray[i] == sem){
				if(pointArray[i] > 50){
					j++;
					sum += parseInt(pointArray[i]);
				}
			}
		}
	}
	ave = sum / j;
	return ave;
}

//სვავს კოდში საშუალო ქულის გამოსათვლელ ფრაგმენტს
function Add_averageCell(){
    var str = "<br><span id='semesterSpan' style='font-size:11pt;font-weight:bold;'></span>";
    $('#ctl00_C1_SumGPA').after(str);
    var setSelect = document.createElement("select");
    setSelect.id = "semesterIndex";
    setSelect.addEventListener("change", function () {
        document.getElementById("semesterAverage").innerHTML = parseFloat(Count_average(this.selectedIndex)).toFixed(2);
        
    });
    var getSpan = document.getElementById("semesterSpan");
    getSpan.appendChild(setSelect);

    var opt = document.createElement("option");
    opt.value = "*";
    opt.text = "*";
    setSelect.appendChild(opt);
    //
    var semCapacity = semesterArray[semesterArray.length - 1];
    for (var i = 1; i <= semCapacity; i++) {
        var opt = document.createElement("option");
        opt.text = i;
        setSelect.appendChild(opt);
    }
    var semAve = "&nbsp;სემესტრის საშუალო ქულა: <b id='semesterAverage'></b>";
    $('#semesterIndex').after(semAve);
    document.getElementById("semesterAverage").innerHTML = parseFloat(Count_average(0)).toFixed(2);
    
}
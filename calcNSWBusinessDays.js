/*jsl:option explicit*/

function BusinessDays(targetYear){

	// targetYear is FY. e.g. FY 2011 Ends June 30, 2011


	function dateSN(d){ return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();}

	function getFYTest(start, last){
		var startSN = dateSN(start);
		var endSN = dateSN(last);
		return function(d){
			var testSN = dateSN(d);
			return testSN >= startSN && testSN <= endSN;
		};
	}


	function addDay(d){ return new Date(d.getTime() + 24 * 3600000);}
	function addDays(d, n){ return new Date(d.getTime() + (n * 24 * 3600000));} // add calendar days
	function sameDay(d1, d2){
		return d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate();
	}



	function getHolidays(baseYear){

		/*
		based on NSW legislated Holidays:
			http://www.legislation.nsw.gov.au/maintop/view/inforce/act+115+2010+cd+0+N
The following public holidays are declared for the whole State:

    (a)  New Year’s Day
    Public holiday on 1 January.
    When 1 January is a Sunday, there is to be no public holiday on that day and instead the following day (Monday) is to be a public holiday.

    (b)  Australia Day
    Public holiday on 26 January.
    When 26 January is a Saturday or Sunday, there is to be no public holiday on that day and instead the following Monday is to be a public holiday.

    (c)  Good Friday
    Public holiday on the Friday publicly observed as Good Friday.

    (d)  Easter Saturday
    Public holiday on the day after Good Friday.

    (e)  Easter Sunday
    Public holiday on the Sunday following Good Friday.

    (f)  Easter Monday
    Public holiday on the Monday following Good Friday.

    (g)  Anzac Day
    Public holiday on 25 April.
    When 25 April is a Sunday, there is to be no public holiday on that day and instead the following day (Monday) is to be a public holiday.

    (h)  Queen’s Birthday
    Public holiday on the second Monday in June.

    (i)  Labour Day
    Public holiday on the first Monday in October.

    (j)  Christmas Day
    Public holiday on 25 December.
    When 25 December is a Sunday, there is to be no public holiday on that day and instead the following day (Monday) is to be a public holiday.

    (k)  Boxing Day
    Public holiday on 26 December.
    When 26 December is a Sunday, there is to be no public holiday on that day and instead the following day (Monday) is to be a public holiday.
    When 26 December is a Monday, there is to be no public holiday on that day for Boxing Day and instead the following day (Tuesday) is to be a public holiday for Boxing Day.

		*/


		function getNth(month, targetday, nTh){
			var monthStart = new Date(baseYear , month, 1);
			var monthFrom = monthStart.getDay();
			var offset = 7 * (nTh - 1) + (function(){
				if( targetday == monthFrom ) return 0;
				if( targetday < monthFrom) return (7-(monthFrom - targetday));
				return (targetday - monthFrom);
			})();
			return new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 + offset);
		}


		function getHoliday(month, day){
			return new Date(baseYear, month, day);
		}

		function getFollowing(month,day,follows){
			if(!follows) follows = [6,0]; // default to Saturday and Sunday
			var d = new Date(baseYear, month, day);
			var isDay = d.getDay();
			function onToFollow(testDay){
				for(var i = 0; i< follows.length; i++){
					if(testDay == follows[i]) return true;
				}
				return false;
			}
			if(!onToFollow(isDay)) return null;

			while(onToFollow(isDay)) {
				d = addDay(d);
				isDay = d.getDay();
			}
			return d;
		}

		function getLast(month, targetday){
			var fourth = getNth(month, targetday, 4);
			var fifth = new Date(fourth.getTime() + 7 * 24 * 3600000);
			return fourth.getMonth() == fifth.getMonth() ? fifth : fourth;
		}

		var holidaySet = [];
		function includeDay(dayName, d){
			if(d){
				holidaySet[dateSN(d)] = {date:d, holiday:dayName}; // include day may add duplicates; use set op to filter
			}
		}

		//months in Javascript count from 0. e.g. May is month 4
		includeDay('New Years Day', getHoliday(0,1)); //New Years
		includeDay('New Years Day(observed)', getFollowing(0,1),[0]); //New Years observed
		includeDay('Australia Day', getHoliday(0,26)); //Australia Day
		includeDay('Australia Day(observed)', getFollowing(0,26)); //Australia Day observed

		var easterSunday = getEaster(baseYear);
		var goodFriday = addDays(easterSunday, -2);
		var easterMonday = addDay(easterSunday);

		includeDay('Good Friday', goodFriday);
		includeDay('Easter Sunday', easterSunday);
		includeDay('Easter Monday', easterMonday);

		var anzacDay = getHoliday(3,25);
		if(sameDay(anzacDay, goodFriday) ||
				sameDay(anzacDay, easterSunday) ||
				sameDay(anzacDay, easterMonday) ||
				sameDay(anzacDay, addDay(goodFriday)))
		{
			includeDay('ANZAC Day(observed)', addDay(easterMonday)); //ANZAC Day observed near Easter
		}else{
			includeDay('ANZAC Day', anzacDay); // ANZAC Day
			includeDay('ANZAC Day(observed)', getFollowing(3,25,[0])); //ANZAC Day observed
		}

		includeDay("Queen's Birthday", getNth(5,1,2)); //Queens Birthday 2nd Monday in June
		includeDay('Labour Day', getNth(9,1,1)); //Labour Day 1st Monday in October
		includeDay('Christmas Day', getHoliday(11,25)); //Christmas
		includeDay('Christmas Day(observed)', getFollowing(11,25)); //Christmas observed
		includeDay('Boxing Day', getHoliday(11,26)); //Boxing Day
		includeDay('Boxing Day(observed)', getFollowing(11,26, [0,1])); //Boxing Day observed

		var hDays = [];
		for(var d in holidaySet) hDays.push(holidaySet[d]);
		return hDays;
	}

	this.holidays = getHolidays(targetYear - 1).concat(getHolidays(targetYear)).concat(getHolidays(targetYear + 1)); // alllows adding days out into the future

	this.isSameDay = sameDay;

	this.isBusinessDay = function(date){
		var weekDay = date.getDay();
		if(weekDay === 0 || weekDay === 6)  return false;
		for(var i = 0; i< this.holidays.length; i++){
			if(sameDay((this.holidays[i]).date, date)) return false;
		}
		return true;
	};

	this.addBusinessDays = function(date, n){
		if(n > 255) throw new Error("function only works on dates within about a calendar year");
		var bd = date;
		var daysAdded = 0;
		while(daysAdded < n){
			bd = addDay(bd); daysAdded++;
			while(!this.isBusinessDay(bd)) bd = addDay(bd);
		}
		return bd;
	};


	function getEaster(year){
	var ed = []; //Easter Dates
	ed[2009] = 'April-12';    ed[2010] = 'April-4';
	ed[2011] = 'April-24';		ed[2012] = 'April-8';		ed[2013] = 'March-31';
	ed[2014] = 'April-20';		ed[2015] = 'April-5';		ed[2016] = 'March-27';
	ed[2017] = 'April-16';		ed[2018] = 'April-1';		ed[2019] = 'April-21';
	ed[2020] = 'April-12';		ed[2021] = 'April-4';		ed[2022] = 'April-17';
	ed[2023] = 'April-9';		ed[2024] = 'March-31';		ed[2025] = 'April-20';
	ed[2026] = 'April-5';		ed[2027] = 'March-28';		ed[2028] = 'April-16';
	ed[2029] = 'April-1';		ed[2030] = 'April-21';		ed[2031] = 'April-13';
	ed[2032] = 'March-28';		ed[2033] = 'April-17';		ed[2034] = 'April-9';
	ed[2035] = 'March-25';		ed[2036] = 'April-13';		ed[2037] = 'April-5';
	ed[2038] = 'April-25';		ed[2039] = 'April-10';		ed[2040] = 'April-1';
	ed[2041] = 'April-21';		ed[2042] = 'April-6';		ed[2043] = 'March-29';
	ed[2044] = 'April-17';		ed[2045] = 'April-9';		ed[2046] = 'March-25';
	ed[2047] = 'April-14';		ed[2048] = 'April-5';		ed[2049] = 'April-18';
	ed[2050] = 'April-10';		ed[2051] = 'April-2';		ed[2052] = 'April-21';
	ed[2053] = 'April-6';		ed[2054] = 'March-29';		ed[2055] = 'April-18';
	ed[2056] = 'April-2';		ed[2057] = 'April-22';		ed[2058] = 'April-14';
	ed[2059] = 'March-30';		ed[2060] = 'April-18';		ed[2061] = 'April-10';
	ed[2062] = 'March-26';		ed[2063] = 'April-15';		ed[2064] = 'April-6';
	ed[2065] = 'March-29';		ed[2066] = 'April-11';		ed[2067] = 'April-3';
	ed[2068] = 'April-22';		ed[2069] = 'April-14';		ed[2070] = 'March-30';
	ed[2071] = 'April-19';		ed[2072] = 'April-10';		ed[2073] = 'March-26';
	ed[2074] = 'April-15';		ed[2075] = 'April-7';		ed[2076] = 'April-19';
	ed[2077] = 'April-11';		ed[2078] = 'April-3';		ed[2079] = 'April-23';
	ed[2080] = 'April-7';		ed[2081] = 'March-30';		ed[2082] = 'April-19';
	ed[2083] = 'April-4';		ed[2084] = 'March-26';		ed[2085] = 'April-15';
	ed[2086] = 'March-31';		ed[2087] = 'April-20';		ed[2088] = 'April-11';
	ed[2089] = 'April-3';		ed[2090] = 'April-16';		ed[2091] = 'April-8';
	ed[2092] = 'March-30';		ed[2093] = 'April-12';		ed[2094] = 'April-4';
	ed[2095] = 'April-24';		ed[2096] = 'April-15';		ed[2097] = 'March-31';
	ed[2098] = 'April-20';		ed[2099] = 'April-12';


		var easterSpec = ed[year];
		if(easterSpec){
			var parts = /(April|March)-(\d+)/.exec(easterSpec);
			var month = parts[1] == 'March' ? 2 : 3; // just March or April (js month #)
			return new Date(parseInt(year,10), month, parseInt(parts[2],10));
		}
		throw "No Easter Date Calculated for "+ year;
	}
	var bizDays = this;
	function getBusinessDays(baseYear){

		var fyStartDay = new Date(targetYear - 1, 6, 1, 0, 0, 0);
		var fyLastDay = new Date(targetYear, 5, 30, 0, 0, 0);

		var inFY = getFYTest(fyStartDay, fyLastDay);

		function BusinessDay(calDay, quarter, bdInMonth, bdInQuarter, bdInFYear){
			this.date = calDay;
			this.quarter = quarter;
			this.BD = bdInMonth;
			this.BDInQtr = bdInQuarter;
			this.BDInYear = bdInFYear;
		}
		var days = [];

		function getMonthBD(monthStart, startVals){
			var monthDays = [];
			var monthNum = monthStart.getMonth();

			if(!bizDays.isBusinessDay(monthStart)) monthStart = bizDays.addBusinessDays(monthStart, 1);
			if(monthStart.getMonth() != monthNum) throw new Error('Cannot find business month start for '+ new Date(baseYear, monthNum, 1));

			var atDay = monthStart;
			var bdInMonth = 1;
			var bdInQtr = startVals.qtrDay;
			var bdInYear = startVals.yearDay;

			monthDays.push(new BusinessDay(atDay, startVals.qtr, bdInMonth++, bdInQtr++, bdInYear++));
			atDay = bizDays.addBusinessDays(atDay, 1);
			while(atDay.getMonth() == monthNum){
				monthDays.push(new BusinessDay(atDay, startVals.qtr, bdInMonth++, bdInQtr++, bdInYear++));
				atDay = bizDays.addBusinessDays(atDay, 1);
			}
			days = days.concat(monthDays);
			return {qtrDay:bdInQtr, qtr:startVals.qtr, yearDay:bdInYear};
		}

		function getFMonth(year, month){ return new Date(year, month - 1, 1, 0, 0, 0);} // adjusts month to JS month JS date numbers are 0 based July = 6 not 7

		var startVals = {qtrDay:1, qtr: 1, yearDay:1};
		startVals = getMonthBD(getFMonth(baseYear - 1, 7), startVals); // July Q1
		startVals = getMonthBD(getFMonth(baseYear - 1, 8), startVals);
		startVals = getMonthBD(getFMonth(baseYear - 1, 9), startVals);

		startVals = {qtrDay:1, qtr:2, yearDay:startVals.yearDay};
		startVals = getMonthBD(getFMonth(baseYear - 1, 10), startVals); // Oct Q2
		startVals = getMonthBD(getFMonth(baseYear - 1, 11), startVals);
		startVals = getMonthBD(getFMonth(baseYear - 1, 12), startVals);

		startVals = {qtrDay:1, qtr:3, yearDay:startVals.yearDay};
		startVals = getMonthBD(getFMonth(baseYear, 1), startVals); // Jan Q3
		startVals = getMonthBD(getFMonth(baseYear, 2), startVals);
		startVals = getMonthBD(getFMonth(baseYear, 3), startVals);

		startVals = {qtrDay:1, qtr:4, yearDay:startVals.yearDay};
		startVals = getMonthBD(getFMonth(baseYear, 4), startVals); // April Q4
		startVals = getMonthBD(getFMonth(baseYear, 5), startVals);
		getMonthBD(getFMonth(baseYear, 6), startVals);

		return days;
	}

	this.businessDays = getBusinessDays(targetYear);

	this.calendarSlice = function(startDate, endDate){
		var workingYear = targetYear;
		var startSN = dateSN(startDate);
		var endSN = dateSN(endDate);
		var bd = this.businessDays;
		var calendarDays = [];
		var i = 0;
		do{
			var bdSN = dateSN(bd[i].date);
			if(bdSN >= startSN && bdSN < endSN) calendarDays.push(bd[i]);
			i++;
			if(i == bd.length){ // run out of days
				var next = new BusinessDays(++workingYear);
				bd = bd.concat(next.businessDays);
			}
		}while(bdSN < endSN);
		return calendarDays;
	};

	this.getCalendar = function(holidaysOnly){
		var fyCal = [];
		var inFY = getFYTest(new Date(targetYear - 1, 6, 1, 0, 0, 0), new Date(targetYear, 5, 30, 0, 0, 0));
		for(var h = 0; h< this.holidays.length; h++){
			var day = (this.holidays[h]).date;
			if(inFY(day)) fyCal[dateSN(day)] = this.holidays[h];
		}
		if(!holidaysOnly){
			for(h = 0; h<this.businessDays.length; h++){
				var bday = this.businessDays[h].date;
				if(inFY(bday)){
 					fyCal[dateSN(bday)] = this.businessDays[h];
				}
			}
		}

		var calDates = [];
		for(var i = (targetYear - 1) * 10000; i< fyCal.length; i++){
    	if(!fyCal[i]) continue;
      calDates.push(fyCal[i]);
    }
		return calDates;
	};

}


function businessDaysShowCalendar(request, response){
		var calForm = nlapiCreateForm("Fiscal Year Calendar", false);
	  var fld = calForm.addField('calyear','text','FY Ending');
	  var now = new Date();
	  var holOnly = calForm.addField('calholidaysonly', 'checkbox', 'Holidays Only?');
	  if('T' == request.getParameter('calholidaysonly')) holOnly.setDefaultValue('T');
	  fld.setDefaultValue((parseInt(request.getParameter('calyear'),10) || ((now.getMonth() >= 6) ? now.getFullYear() + 1 : now.getFullYear())).toFixed(0));

		if(request.getMethod() == "POST"){

			var BD = new BusinessDays(parseInt(request.getParameter('calyear'),10));

			var dayCodes = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

			var calList = BD.getCalendar('T' == request.getParameter('calholidaysonly'));

			var calArea = calForm.addField('custpage_callist', 'inlinehtml');
			calArea.setLayoutType('outsidebelow', 'startrow');
			calArea.setDefaultValue(
				"<table cellpadding='5' cellspacing='0'><tr>"+
					"<th>Date</th>"+
					"<th>in Month</th>"+
					"<th>in Quarter</th>"+
					"<th>in Year</th>"+
				"</tr>"+ 	calList.map(function(calDate){
						if(calDate.holiday){
							return "<tr><td>"+ dayCodes[calDate.date.getDay()] +" "+ nlapiDateToString(calDate.date)+"</td>"+
							"<td colspan='3'>"+ calDate.holiday +"</td></tr>";
						}
						return "<tr><td>"+ dayCodes[calDate.date.getDay()] +" "+ nlapiDateToString(calDate.date)+"</td>"+
							"<td>"+ calDate.BD +"</td>"+
							"<td>"+ calDate.BDInQtr +"</td>"+
							"<td>"+ calDate.BDInYear +"</td>"+
							"</tr>";
				}).join("\n") + "</table>");
		}

		calForm.addSubmitButton("Show Calendar");
		response.writePage(calForm);
	}




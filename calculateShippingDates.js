/*jsl:option explicit*/

function ShippingDays(){
	var ONE_DAY = 24 * 3600000;
	function addDay(d){ return new Date(d.getTime() + ONE_DAY);}

	var holidays = (function(){

		/*
		based on UPS holidays to calculate shipping days.

		Memorial Day - May 30, 2011* (4th Monday in May
		Independence Day - July 4, 2011*
		Labor Day - September 5, 2011* 1st Monday in Sept.
		Thanksgiving Day - November 24, 2011* Last Thursday in Oct
		Day after Thanksgiving - November 25, 2011**
		Christmas (observed) - December 26, 2011*
		New Year's Eve - December 31, 2011
		New Year's Day (observed) - January 2, 2012*
		*/


		var now = new Date();
		var baseYear = now.getFullYear();


		function getNth(month, targetday, nTh){
			var useYear = month === 0 ? baseYear + 1 : baseYear;
			var monthStart = new Date(useYear , month, 1);
			var monthFrom = monthStart.getDay();
			var offset = 7 * (nTh - 1) + (function(){
				if( targetday == monthFrom ) return 0;
				if( targetday < monthFrom) return (7-(monthFrom - targetday));
				return (targetday - monthFrom);
			})();
			return new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 + offset);
		}


		function getHoliday(month, day){
			var useYear = month === 0 ? baseYear + 1 : baseYear;
			return new Date(useYear, month, day);
		}

		function getFollowing(month,day){
			var useYear = month === 0 ? baseYear + 1 : baseYear;
			var d = new Date(useYear, month, day);
			var isDay = d.getDay();
			if(!(isDay === 0 || isDay === 6))  return null;

			while(isDay === 0 || isDay === 6) {
				d = addDay(d);
				isDay = d.getDay();
			}
			return d;
		}

		function getLast(month, targetday){
			var fourth = getNth(month, targetday, 4);
			var fifth = new Date(fourth.getTime() + 7 * ONE_DAY);
			return fourth.getMonth() == fifth.getMonth() ? fifth : fourth;
		}


		function includeDay(d){if(d) holidays.push(d);}

		var holidays = [];

		//months in Javascript count from 0. e.g. May is month 4
		includeDay(getNth(4,1,4)); // Memorial Day 4th Monday in May
		includeDay(getHoliday(6,4)); // July 4th
		includeDay(getFollowing(6,4)); // following Monday if on weekend
		includeDay(getNth(8,1,1)); //Labour Day 1st Monday in September
		includeDay(getLast(10,4)); // Thanksgiving last Thursday in Nov.
		includeDay(addDay(getLast(10,4))); // day after thanksgiving
		includeDay(getHoliday(11,25)); //Christmas
		includeDay(getFollowing(11,25)); //Christmas observed
		includeDay(getHoliday(11,31)); //New Years Eve
		includeDay(getHoliday(0,1)); //New Years
		includeDay(getFollowing(0,1)); //New Years observed

		baseYear++; // just calc next year too. Allow 365 day lookup from wherever in the year

		includeDay(getNth(4,1,4)); // Memorial Day 4th Monday in May
		includeDay(getHoliday(6,4)); // July 4th
		includeDay(getFollowing(6,4)); // following Monday if on weekend
		includeDay(getNth(8,1,1)); //Labour Day 1st Monday in September
		includeDay(getLast(10,4)); // Thanksgiving last Thursday in Nov.
		includeDay(addDay(getLast(10,4))); // day after thanksgiving
		includeDay(getHoliday(11,25)); //Christmas
		includeDay(getFollowing(11,25)); //Christmas observed
		includeDay(getHoliday(11,31)); //New Years Eve
		includeDay(getHoliday(0,1)); //New Years
		includeDay(getFollowing(0,1)); //New Years observed


		return holidays;
	})();

	function isBusinessDay(date){
		var weekDay = date.getDay();
		if(weekDay === 0 || weekDay === 6)  return false;
		for(var i = 0; i< holidays.length; i++){
			if(holidays[i].getFullYear() == date.getFullYear() &&
				holidays[i].getMonth() == date.getMonth() &&
				holidays[i].getDate() == date.getDate()) return false;
		}
		return true;
	}

	this.addDays = function(date, n){
		if(n > 255) throw new Error("function only works on dates within about a calendar year");
		var bd = date;
		var daysAdded = 0;
		while(daysAdded < n){
			bd = addDay(bd); daysAdded++;
			while(!isBusinessDay(bd)) bd = addDay(bd);
		}
		return bd;
	};

	this.getLastOfMonth = function(date){
		var thisMonth = date.getMonth();
		var lastDay = new Date(date.getTime());
		while(isBusinessDay(lastDay) && lastDay.getMonth() == thisMonth){
			lastDay = addDay(lastDay);
		}
		if(lastDay.getMonth() == thisMonth) return lastDay; // found one; otherwise back up
		do{
			lastDay = new Date(lastDay.getDate() - ONE_DAY);
		}while(!isBusinessDay(lastDay));
		return lastDay;
	};
}


function getWFShippingDays(){
		var fromDate = nlapiGetContext().getSetting('SCRIPT', 'custscript_wf_ship_from_date');
		var days = parseInt(nlapiGetContext().getSetting('SCRIPT', 'custscript_wf_shipdays'),10);

		nlapiLogExecution("DEBUG","get "+ days + " shippping days from : "+ (fromDate || new Date()));

		return nlapiDateToString(new ShippingDays().addDays(fromDate ? nlapiStringToDate(fromDate) : new Date(), days));
}
///<reference path='c:\development\Netsuite\SuiteScriptAPITS.d.ts'/>
function simpleBatch(arr : any[], proc : (t :any, idx: number, a:any[]) => void, reserve? :number, maxMinutes? :number){
	if(!arr || !arr.length) return;
	var maxUsage = reserve || 0;
	var breakTime = maxMinutes ? (new Date().getTime() + 60000*maxMinutes) : 0;
	var startUsage = nlapiGetContext().getRemainingUsage();
	for(var i = 0; i< arr.length; i++){
		if(startUsage < (maxUsage + 20) || (breakTime && new Date().getTime() > breakTime)){
			var ys = nlapiYieldScript();
			if(ys.status == 'FAILURE'){
				nlapiLogExecution('ERROR', "Unable to Yield "+ ys.reason, ys.information);
			}
			nlapiLogExecution("AUDIT", "After resume had: "+ startUsage +" remaining vs max: "+ maxUsage);
			startUsage = nlapiGetContext().getRemainingUsage();
			breakTime = maxMinutes ? (new Date().getTime() + 60000*maxMinutes) : 0;
		}
		proc(arr[i], i, arr);
		if(nlapiGetContext().getExecutionContext() == "scheduled") nlapiGetContext().setPercentComplete( ((100*i)/arr.length ).toFixed(1));

		var endUsage = nlapiGetContext().getRemainingUsage();
		var runUsage = startUsage - endUsage;
		if(maxUsage < runUsage) maxUsage = runUsage;
		startUsage = endUsage;
	}
}

function batchIterator(iter:()=>any, proc : (t :any, idx:number) => void, reserve? :number, maxMinutes? :number, beforeYield ?:() => void, afterYield ?:() => void){
	var maxUsage = reserve || 0;
	var breakTime = maxMinutes ? (new Date().getTime() + 60000*maxMinutes) : 0;
	var startUsage = nlapiGetContext().getRemainingUsage();
	var isScheduled = "scheduled" == nlapiGetContext().getExecutionContext();
	var elemsProcessed = 0;
	var elem = iter();
	while(elem && typeof elem != 'undefined'){
		if(startUsage < (maxUsage + 20) || (breakTime && new Date().getTime() > breakTime)){
			if(!isScheduled){
				nlapiLogExecution("SYSTEM", "non-Scheduled run ending with "+startUsage +" units remaining");
				break;
			} 
			if(beforeYield) beforeYield();
			var ys = nlapiYieldScript();
			if(ys.status == 'FAILURE'){
				nlapiLogExecution('ERROR', "Unable to Yield "+ ys.reason, ys.information);
			}
			nlapiLogExecution("AUDIT", "After resume had: "+ startUsage +" remaining vs max: "+ maxUsage);
			startUsage = nlapiGetContext().getRemainingUsage();
			breakTime = maxMinutes ? (new Date().getTime() + 60000*maxMinutes) : 0;
			if(afterYield) afterYield();
		}
		proc(elem, elemsProcessed);
		elemsProcessed++;
		var endUsage = nlapiGetContext().getRemainingUsage();
		if(isScheduled) nlapiGetContext().setPercentComplete( (100*(startUsage - endUsage)/(startUsage)).toFixed(1));
		var runUsage = startUsage - endUsage;
		if(maxUsage < runUsage) maxUsage = runUsage;
		startUsage = endUsage;
		elem =  iter();
	}
}

function dynamicBatch(arr : any[], proc : (t :any, idx:number) => void, reserve? :number, maxMinutes? :number, beforeYield ?:() => void, afterYield ?:() => void){
	if(!arr || !arr.length) return;
	batchIterator(
		function(){
			if(arr.length) return arr.shift();
			return null;
		},
		proc,
		reserve, maxMinutes, beforeYield, afterYield);
}
function batchProcess(getContext, getTargets, processTarget, rerunParams) {
    var targetUsage = 0;
    var rawContext = {
        getTargetsUsage: function () {
            return targetUsage;
        },
        getMaxUsage: function () {
            return targetUsage;
        }
    };
    var context = getContext(rawContext);
    var targetStartUsage = nlapiGetContext().getRemainingUsage();
    var targets = getTargets(context, false);
    targetUsage = targetStartUsage - nlapiGetContext().getRemainingUsage();
    if(!targets || !targets.length) {
        nlapiLogExecution('DEBUG', 'batch process', 'No targets found to process');
        return;
    }
    targets = [].concat(targets)// make it a true array and make it independent of orig target; sometimes NS weirdness
    ;
    try  {
        var targetCount = 0;
        var maxUsage = 0;
        var origTargetLength = targets.length;
        each(targets, function (idx, target) {
            var initUsage = nlapiGetContext().getRemainingUsage();
            try  {
                var flag = processTarget.call(typeof target == 'object' ? target : {
                }, context, target);
                if(typeof flag != 'undefined' && !flag) {
                    return false;
                }
            } catch (e) {
                nlapiLogExecution('ERROR', 'error processing target', (e.message || e.toString()) + (e.getStackTrace ? '\n\n' + e.getStackTrace().join('\n') : ''));
                return false;// exit on failure. processTarget should catch own errors to continue on failure.
                
            }
            var remainUsage = nlapiGetContext().getRemainingUsage();
            var passUsage = initUsage - remainUsage;
            if(passUsage > maxUsage) {
                maxUsage = passUsage;
            }
            targetCount++;
            if(nlapiGetContext().getExecutionContext() == "scheduled") {
                var usageToFinish = targets.length * maxUsage;
                if(targets.length && usageToFinish < remainUsage) {
                    //in simple case targets.length decrements once per iteration
                    var pctRemaining = targets.length / (targets.length + targetCount);
                    nlapiGetContext().setPercentComplete((100 * (1 - pctRemaining)).toFixed(1));
                } else {
                    nlapiGetContext().setPercentComplete((100 * (1 - (remainUsage / targetStartUsage))).toFixed(1));
                }
            }
            var canGo = remainUsage > (maxUsage + targetUsage + 10);// an iteration plus the follow up targetUsage + 10
            
            context.getMaxUsage = function () {
                return maxUsage;
            };
            nlapiLogExecution("DEBUG", "usage profile", "remaining: " + remainUsage + "\npassUsage: " + passUsage + "\nmaxUsage: " + maxUsage);
            if(!canGo) {
                nlapiLogExecution('AUDIT', 'Processing Targets', 'processed: ' + targetCount + ' targets');
            }
            return canGo;
        });
        var remainder = getTargets(context, true);
        if(remainder && remainder.length) {
            if(nlapiGetContext().getExecutionContext() == "scheduled") {
                //check executionContext to avoid invalid calls in debugger
                var status = nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), rerunParams(context));
                nlapiLogExecution('AUDIT', 'Processing Targets', "finished run " + remainder.length + " targets left to process. Rescheduled: " + status);
            } else {
                nlapiLogExecution('AUDIT', 'Processing Targets', "finished non-scheduled run " + remainder.length + " targets left to process.");
            }
        }
    } catch (e) {
        nlapiLogExecution('ERROR', e.message || e.toString(), e.message || e.toString() + (e.getStackTrace ? '\n\n' + e.getStackTrace().join('\n') : ''));
    }
    function each(arr, fcn) {
        var idx = 0;
        while(true) {
            if(!arr || !arr.length) {
                return;
            }
            var target = arr.shift();// use shift so that processTarget can add or remove elements from the list
            
            if(!target) {
                return;
            }
            var x = fcn.call(typeof target == 'object' ? target : null, idx, target);
            if(typeof x != 'undefined' && x !== null && !(x)) {
                return;
            }
            idx++;
        }
    }
}

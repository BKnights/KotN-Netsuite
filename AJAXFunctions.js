///<reference path='c:\development\Netsuite\SuiteScriptAPITS.d.ts'/>
/*
Utility Functions
© 2008 - 2012 Brett Knights.
This EULA grants you the following rights:
Installation and Use. You may install and use an unlimited number of copies of the SOFTWARE PRODUCT.
Reproduction and Distribution. You may reproduce and distribute an unlimited number of copies of the SOFTWARE PRODUCT
either in whole or in part; each copy should include all copyright and trademark notices, and shall be accompanied by a copy of this EULA.
Copies of the SOFTWARE PRODUCT may be distributed as a standalone product or included with your own product.
Commercial Use. You may sell for profit and freely distribute scripts and/or compiled scripts that were created with the SOFTWARE PRODUCT.

For permission, contact brett@knightsofthenet.com

*/
var KOTNUtil;
(function (KOTNUtil) {
    function sendJSResponse(request, response, respObject) {
        var startTime = new Date().getTime();
        response.setContentType('JAVASCRIPT');
        var callbackFcn = request.getParameter("callback") || request.getParameter("jsoncallback");
        if(callbackFcn) {
            response.writeLine(callbackFcn + "(" + JSON.stringify(respObject) + ");");
        } else {
            response.writeLine(JSON.stringify(respObject));
        }
        nlapiLogExecution("DEBUG", "sendJSResponse", (new Date().getTime() - startTime) + " ms");
    }
    KOTNUtil.sendJSResponse = sendJSResponse;
    function unique(arr) {
        var u = [];
        noadd:
for(var i = 0; i < arr.length; i++) {
            for(var k = 0; k < u.length; k++) {
                if(arr[i] == u[k]) {
                    continue noadd;
                }
            }
            u.push(arr[i]);
        }
        return u;
    }
    KOTNUtil.unique = unique;
    function toJSON(target) {
        return JSON.stringify(target);
    }
    KOTNUtil.toJSON = toJSON;
    ; ;
})(KOTNUtil || (KOTNUtil = {}));

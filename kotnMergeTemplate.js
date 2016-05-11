
	function kotnMergeTemplate(templateId, primType, primId, secType, secId, extraFields, outType){
		
		var template = nlapiLoadRecord('emailtemplate', templateId);
		if('FREEMARKER' != template.getFieldValue('templateversion')){
			return nlapiMergeRecord(templateId, primType, primId, secType, secId, extraFields);
		}

		var renderer = nlapiCreateTemplateRenderer();

		var content = 'T' == template.getFieldValue('usesmedia') ?
		    (function(){
		      var file = nlapiLoadFile(template.getFieldValue('mediaitem'));
		      return file.getValue();
		    })() :
		    template.getFieldValue('content');

			var custFieldPatt = /\{\{([^\}]+)\}\}/g;
			content = content.replace(custFieldPatt, function(a,m){
				return extraFields[m] || extraFields[m.toUpperCase()] || extraFields[m.toLowerCase()] || '';
			});

			var oldCustFieldPatt = /<(nl[^ >]+)>(\s*<\/\1>)?/ig;
			content = content.replace(oldCustFieldPatt, function(a,m){
				return extraFields[m.toUpperCase()] || extraFields[m.toLowerCase()] || '';
			});


		var fillStandards = function (suppliedType, rec){
			if(rec.getFieldValue('trandate') && suppliedType != 'transaction' ) renderer.addRecord('transaction', rec);	
			if(rec.getFieldValue('entityid') && suppliedType != 'entity') renderer.addRecord('entity', rec);
			if('supportcase' == rec.getRecordType() && suppliedType != 'case') renderer.addRecord('case', rec);
		};

		if(secType) {
			var secRec = nlapiLoadRecord(secType, secId);
			renderer.addRecord(secType, secRec);	
			fillStandards(secType, secRec);
		}

		if(primType) {
			var primRec = nlapiLoadRecord(primType, primId);
			renderer.addRecord(primType, primRec);
			fillStandards(primType, primRec);
		}
		

		var getRendered = function (tmplt){
			 renderer.setTemplate(tmplt); 
			 return renderer.renderToString();
		};

		return nlapiCreateFile(getRendered(template.getFieldValue('subject')),  outType || 'HTMLDOC', getRendered(content));
	}

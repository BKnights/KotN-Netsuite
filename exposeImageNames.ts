///<reference path='c:\development\Netsuite\SuiteScriptAPITS.d.ts'/>

module kotnShadowImageNames{

	/**
	 * copy standard store images allow image names in feeds
	 * @param  {string} type event type
	 * @return {void}
	 */
	export function itemBeforeSubmit(type) {
	    if (type == 'edit' || type == 'create') {
	        var imageName = nlapiGetFieldText('storedisplayimage');
	        if (imageName && imageName != nlapiGetFieldValue('custitem_kotn_image_name')) nlapiSetFieldValue('custitem_kotn_image_name', imageName);

	        var thumbnailName = nlapiGetFieldText('storedisplaythumbnail');
	        if (thumbnailName && thumbnailName != nlapiGetFieldValue('custitem_kotn_thumbnail_name')) nlapiSetFieldValue('custitem_kotn_thumbnail_name', thumbnailName);
	    }
	}

	export function itemAfterSubmit(type){
		nlapiLogExecution('DEBUG', type +' after submit with matrix type: '+ nlapiGetFieldValue('matrixtype'));
		if(type == 'edit' || type == 'create' || type == 'xedit'){
			if(!nlapiGetContext().getFeature('MATRIXITEMS') ) return;
			var oldRec = nlapiGetOldRecord();
			var imageName = nlapiGetFieldValue('custitem_kotn_image_name');
			if(imageName && oldRec && oldRec.getFieldValue('custitem_kotn_image_name') == imageName) imageName = null;

			var thumbnailName = nlapiGetFieldValue('custitem_kotn_thumbnail_name');
			if(thumbnailName && oldRec && oldRec.getFieldValue('custitem_kotn_thumbnail_name') == thumbnailName) thumbnailName = null;

			if(imageName || thumbnailName){
				var childItems = nlapiSearchRecord('item', null, [
					new nlobjSearchFilter('parent', null, 'is', nlapiGetRecordId()),
					new nlobjSearchFilter('matrixchild', null, 'is', 'T'),
					new nlobjSearchFilter('isinactive', null, 'is', 'F')
				]);
				if(childItems) {
					var updateFields : string[] = [], updateValues : string[] = [];
					if(imageName){
						updateFields.push('custitem_kotn_image_name');
						updateValues.push(imageName);
					}
					if(thumbnailName){
						updateFields.push('custitem_kotn_thumbnail_name');
						updateValues.push(thumbnailName);
					}
					nlapiLogExecution("DEBUG", "Updating " + childItems.length +" for image names");
					childItems.forEach(function(c){
						nlapiSubmitField(c.getRecordType(), c.getId(), updateFields, updateValues, {disabletriggers:true, enablesourcing:false});
					});
				}
			}
		}
	}

	/**
	 * prefill these fields after install. You'll need a deployment
	 * for each type of item. e.g., Inventory Item, Non-Inventory Item, Serialized Item
	 * @param  {string} recType Record type supplied by the mass update runner
	 * @param  {string|number} recId   Item internal id supplied by the mass update runner
	 */
	export function massImages(recType, recId) {
	    var item = nlapiLoadRecord(recType, recId);
	    var needSave = false;

	    var imageName = item.getFieldText('storedisplayimage') || '';
        if (imageName && imageName != item.getFieldValue('custitem_kotn_image_name')){
        	item.setFieldValue('custitem_kotn_image_name', imageName);
        	needSave = true;
        } 

        var thumbnailName = item.getFieldText('storedisplaythumbnail');
        if (thumbnailName && thumbnailName != item.getFieldValue('custitem_kotn_thumbnail_name')){
        	item.setFieldValue('custitem_kotn_thumbnail_name', thumbnailName);
        	needSave = true;
        }

	    if (needSave) {
	        nlapiSubmitRecord(item, {disabletriggers:true,ignoremandatoryfields:true, enablesourcing:false});
	    }

	    if(!nlapiGetContext().getFeature('MATRIXITEMS') ) return;

	    var filters = [
			new nlobjSearchFilter('parent', null, 'is', recId),
			new nlobjSearchFilter('matrixchild', null, 'is', 'T'),
			new nlobjSearchFilter('isinactive', null, 'is', 'F')
		];

//	    var imageClause = imageName ? "when '"+ imageName +"' != {custitem_kotn_image_name} then 1 " : '';
//	    var thumbClause = thumbnailName ? "when '"+ thumbnailName +"' != {custitem_kotn_thumbnail_name} then 1 " : '';
//		if(imageClause || thumbClause){
//			filters.push(new nlobjSearchFilter('formulanumeric', null, 'equalto', '1').
//				setFormula("case "+ imageClause +" "+ thumbClause +" else 0 end"));
//
//			nlapiLogExecution('DEBUG', 'using formula to find children to update', filters.slice(-1)[0].getFormula());
//		}
		
		var childItems = nlapiSearchRecord('item', null, filters);
		if(childItems) {
			var updateFields : string[] = [], updateValues : string[] = [];
			if(imageName){
				updateFields.push('custitem_kotn_image_name');
				updateValues.push(imageName);
			}
			if(thumbnailName){
				updateFields.push('custitem_kotn_thumbnail_name');
				updateValues.push(thumbnailName);
			}
			nlapiLogExecution('DEBUG', 'applying image update to '+ childItems.length, JSON.stringify(updateFields) +'\n\twith\n'+ JSON.stringify(updateValues));
			childItems.forEach(function(c){
				nlapiSubmitField(c.getRecordType(), c.getId(),updateFields, updateValues,{disabletriggers:true, enablesourcing:false});
			});
		}
					  
	}
}
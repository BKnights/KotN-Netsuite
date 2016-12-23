///<reference path='c:\development\Netsuite\SuiteScriptAPITS.d.ts'/>
var kotnShadowImageNames;
(function (kotnShadowImageNames) {
    /**
     * copy standard store images allow image names in feeds
     * @param  {string} type event type
     * @return {void}
     */
    function itemBeforeSubmit(type) {
        if (type == 'edit' || type == 'create' || type == 'xedit') {
            var imageName = nlapiGetFieldText('storedisplayimage');
            var shadowImage = nlapiGetFieldValue('custitem_kotn_image_name');
            if (imageName && imageName != shadowImage)
                nlapiSetFieldValue('custitem_kotn_image_name', imageName);
            var thumbnailName = nlapiGetFieldText('storedisplaythumbnail');
            var shadowthumbnail = nlapiGetFieldValue('custitem_kotn_thumbnail_name');
            if (thumbnailName && thumbnailName != shadowthumbnail)
                nlapiSetFieldValue('custitem_kotn_thumbnail_name', thumbnailName);
        }
    }
    kotnShadowImageNames.itemBeforeSubmit = itemBeforeSubmit;
    /**
     * prefill these fields after install. You'll need a deployment
     * for each type of item. e.g., Inventory Item, Non-Inventory Item, Serialized Item
     * @param  {string} recType Record type supplied by the mass update runner
     * @param  {string|number} recId   Item internal id supplied by the mass update runner
     */
    function massImages(recType, recId) {
        var item = nlapiLoadRecord(recType, recId);
        var needSave = false;
        var imageName = item.getFieldText('storedisplayimage') || '';
        var shadowImage = item.getFieldValue('custitem_kotn_image_name') || '';
        if (imageName && imageName != shadowImage) {
            item.setFieldValue('custitem_kotn_image_name', imageName);
            needSave = true;
        }
        var thumbnailName = item.getFieldText('storedisplaythumbnail');
        var shadowthumbnail = item.getFieldValue('custitem_kotn_thumbnail_name');
        if (thumbnailName && thumbnailName != shadowthumbnail) {
            item.setFieldValue('custitem_kotn_thumbnail_name', thumbnailName);
            needSave = true;
        }
        if (needSave) {
            nlapiSubmitRecord(item, { disabletriggers: true, ignoremandatoryfields: true, enablesourcing: false });
        }
    }
    kotnShadowImageNames.massImages = massImages;
})(kotnShadowImageNames || (kotnShadowImageNames = {}));

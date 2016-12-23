///<reference path='c:\development\Netsuite\SuiteScriptAPITS.d.ts'/>
var kotnShadowItemTemplate;
(function (kotnShadowItemTemplate) {
    /**
    * copy store template item to field available in searches
    * @param  {string} type event type
    * @return {void}
    */
    function itemBeforeSubmit(type) {
        if (type == 'edit' || type == 'create') {
            var tmplt = nlapiGetFieldText('storeitemtemplate');
            var shadow = nlapiGetFieldValue('custitem_kotn_shadow_template');
            if (tmplt != shadow)
                nlapiSetFieldValue('custitem_kotn_shadow_template', tmplt);
        }
    }
    kotnShadowItemTemplate.itemBeforeSubmit = itemBeforeSubmit;

    /**
    * expose the item template after bundle install. You'll need a deployment
    * for each type of item. e.g., Inventory Item, Non-Inventory Item, Serialized Item
    * @param  {string} recType Record type supplied by the mass update runner
    * @param  {string|number} recId   Item internal id supplied by the mass update runner
    */
    function massShadow(recType, recId) {
        var item = nlapiLoadRecord(recType, recId);
        var tmplt = item.getFieldText('storeitemtemplate') || '';
        var shadow = item.getFieldValue('custitem_kotn_shadow_template') || '';
        if (tmplt != shadow) {
            item.setFieldValue('custitem_kotn_shadow_template', tmplt);
            nlapiSubmitRecord(item, { disabletriggers: true, ignoremandatoryfields: true, enablesourcing: false });
        }
    }
    kotnShadowItemTemplate.massShadow = massShadow;
})(kotnShadowItemTemplate || (kotnShadowItemTemplate = {}));

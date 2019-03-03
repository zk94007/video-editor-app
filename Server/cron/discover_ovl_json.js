var helper = require('../helper/helper');
var overlayModel = require('../model/overlay.model');
var _ = require('underscore');

overlayModel.getOverlays((err, overlays) => {
    if (err) {
        console.log(_err);
        return;
    }

    _.each(overlays, (overlay) => {
        if (overlay.ovl_json.startsWith('{')) {
            const data = [
                {
                    name: 'ovl_json',
                    value: helper.query.base64(overlay.ovl_json)
                }
            ];
            overlayModel.updateOverlay(overlay.ovl_id, data, (_err) => {
                if (_err) {
                    console.log(_err);
                }
            });
        }
    });
});
/**
 * Back-end service
 * konstantyn
 * 2018-03-10
 */

module.exports = {
    user:           require('./user.service'),
    project:        require('./project.service'),
    frame:          require('./frame.service'),
    overlay:        require('./overlay.service'),
    upload_image:   require('./upload_image.service'),
}
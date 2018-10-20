/**
 * Email Helper
 * konstantyn
 * 2018-03-10
 */

/**
 * 
 */
var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');

/**
 * 
 */
var responseHelper = require('./response.helper');
var logHelper = require('./log.helper');
var emailConfig = require('../config/email.config');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        type: 'OAuth2',
        user: 'no.reply.blurbiz@gmail.com',
        clientId: '804635358-gefbehbjrm2min0mgq8plmr6pghmk4fs.apps.googleusercontent.com',
        clientSecret: 'IG28lfMVq89PqNTHLACdVgGR',
        refreshToken: '1/dAgx5abWK2jrfdbBPNbQH5k8xajJBhhnblJ3nK4JjMw',
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = {
    /**
     * 
     * @param {*} options 
     * @param {*} callback 
     */
    sendEmail(options, callback) {
        transporter.sendMail(options, function(err, result) {
            if (err) {
                responseHelper.onError(err, callback);
                return;
            }

            responseHelper.onSuccess(callback, '');
        });
    },

    /**
     * 
     * @param {*} email 
     * @param {*} link 
     * @param {*} callback 
     */
    sendConfirmationEmail(email, link, callback) {
        logHelper.helper('email', 'call sendConfirmation Email : ' + email);
        
        var template = emailConfig.template_signup_confirmation;
        var from = template.from;
        var to = email;
        var subject = template.subject;
        var html = template.html;
        html = html.replace('link_placeholder', link);

        var options = {
            from: from,
            to: to,
            subject: subject,
            html: html,
        };

        this.sendEmail(options, callback);
    },

    /**
     * 
     * @param {*} email 
     * @param {*} link 
     * @param {*} callback 
     */
    sendAdminInvitationEmail(email, link, callback) {
        logHelper.helper('email', 'call sendAdminInvitation Email : ' + email);
        
        var template = emailConfig.template_admin_invitation;
        var from = template.from;
        var to = email;
        var subject = template.subject;
        var html = template.html;
        html = html.replace('link_placeholder', link);

        var options = {
            from: from,
            to: to,
            subject: subject,
            html: html,
        };

        this.sendEmail(options, callback);
    },

    /**
     * 
     * @param {*} email 
     * @param {*} link 
     * @param {*} callback 
     */
    sendResetPasswordEmail(email, link, callback) {
        logHelper.helper('email', 'call resetPassword Email : ' + email);

        var template = emailConfig.template_reset_password;
        var from = template.from;
        var to = email;
        var subject = template.subject;
        var html = template.html;
        html = html.replace('link_placeholder', link);

        var options = {
            from: from,
            to: to,
            subject: subject,
            html: html,
        };

        this.sendEmail(options, callback);
    },
}
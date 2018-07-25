/**
 * Email Config
 * konstantyn
 * 2018-03-10
 */

module.exports = {
    auth: {
        user: 'no.replay.blurbiz@gmail.com',
        password: 'td#blurbiz123',
    },

    template_signup_confirmation: {
        from: 'no.reply.blurbiz@gmal.com',
        subject: 'Signup confirmation',
        html: '<b>To finish registration follow the link:</b> link_placeholder',
    },

    template_reset_password: {
        'from': 'no.reply.blurbiz@gmal.com',
        'subject': 'Reset password',
        'html': '<b>To reset password follow the link:</b> link_placeholder'
    },
}
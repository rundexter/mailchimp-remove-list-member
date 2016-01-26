var _ = require('lodash'),
    request = require('request'),
    util = require('./util'),
    querystring = require('querystring'),
    pickInputs = {
        list_id: {
            key: 'list_id',
            validate: {
                req: true,
                check: 'checkAlphanumeric'
            }
        },
        subscriber_hash: {
            key: 'subscriber_hash',
            validate: {
                req: true,
                check: 'checkAlphanumeric'
            }
        }
    },
    pickOutputs = {
        success: 'success'
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var accessToken = dexter.provider('mailchimp').credentials('access_token'),
            server = dexter.environment('mailchimp_server'),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        if (!server)
            return this.fail('A [mailchimp_server] environment need for this module.');

        if (validateErrors)
            return this.fail(validateErrors);

        var uri = 'lists/' + inputs.list_id + '/members/' + inputs.subscriber_hash,
            baseUrl = 'https://' + server + '.api.mailchimp.com/3.0/';

        request({
            method: 'DELETE',
            baseUrl: baseUrl,
            uri: uri,
            json: true,
            auth : {
                "bearer" : accessToken
            }
        },
        function (error, response, body) {
            if (!error && response.statusCode == 204) {
                this.complete({status: 'Success'});
            } else {
                this.fail(error || body);
            }
        }.bind(this));
    }
};

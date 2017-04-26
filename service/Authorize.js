'use strict';

class Authorize
{
    /**
     * User
     * @param {string} userid
     * @return {void}
     */
    static user (userid) {
        process.stdout.write(`User ${userid} is authenticated via Nymi Band and ready for authorization\n`);
    }
}

module.exports = Authorize;
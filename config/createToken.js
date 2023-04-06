const jwt = require('jsonwebtoken')

module.exports = (data) =>{
    return jwt.sign(data, 'secret', {expiresIn : '7d'} );
}
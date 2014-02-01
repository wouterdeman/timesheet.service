var mongoose = require('mongoose');
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var TokenSchema = new Schema({
  token: {
    type: String
  },
  createDate: {
    type: Date,
    default: Date.now
  }
});

TokenSchema.methods.hasExpired = function() {
  var now = new Date();
  return (now - createDate) > 7; //token is a week old
};

var Token = mongoose.model('Token', TokenSchema);

var save = function(token) {
  token.save();
};

var create = function(token) {
  var newToken = Token({ token: token });
  return newToken;
}

exports.tokenSchema = TokenSchema;
exports.save = save;
exports.create = create;
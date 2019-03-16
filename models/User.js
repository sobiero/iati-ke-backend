const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
  first_name: {type: String, required: true, max: 32 },
  last_name: {type: String, required: true, max: 32 },
  dob: {type:Date },
  national_id: {type:Number, required: true },
  activated: {type:Boolean, default: true },
  updated_date: { type: Date, default: Date.now },
  
  username: {
        type: String,
        unique: true,
        // required: true
  },
  password: {
        type: String,
        // required: true
  },
  
});

UserSchema.pre('save', function(next) {
    var user = this;
       
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function(err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }

});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, (err, isMatch) => {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema)

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true
      }
    },
    {
      timestamps: false
    }
  );

module.exports = mongoose.model('Category', schema);
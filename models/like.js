const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        postId: {
            type: Schema.Types.ObjectId,
            ref: 'Post'
          },
          
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model('Like', schema);
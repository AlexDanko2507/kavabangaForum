const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        postId: {
            type: Schema.Types.ObjectId,
            ref: 'Post'
          },
          
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category'
        }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model('Post_category', schema);
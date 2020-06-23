const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const tr = require('transliter');

const models = require('../models');

// GET for add
router.get('/edit/:id', async (req, res, next) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const id = req.params.id.trim().replace(/ +(?= )/g, '');
  const categoryId = 0;

  if (!userId || !userLogin) {
    res.redirect('/');
  } else {
    try {
      const post = await models.Post.findById(id).populate('uploads');
      const category = await models.Category.find({});
      const categoryPost = await models.Post_category.find({
        postId: id
      })
      .populate('categoryId');
      const catList = [];

      for (let index = 0; index < categoryPost.length; index++) {
        catList.push(categoryPost[index].categoryId.id)
      }

      console.log(catList);

      if (!post) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
      }

      res.render('post/edit', {
        post,
        category,
        categoryId,
        categoryPost,
        catList,
        user: {
          id: userId,
          login: userLogin
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
});

// GET for add
router.get('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId || !userLogin) {
    res.redirect('/');
  } else {
    try {
      const post = await models.Post.findOne({
        owner: userId,
        status: 'draft'
      });

      if (post) {
        res.redirect(`/post/edit/${post.id}`);
      } else {
        const post = await models.Post.create({
          owner: userId,
          status: 'draft'
        });
        res.redirect(`/post/edit/${post.id}`);
      }
    } catch (error) {
      console.log(error);
    }
    // res.render('post/edit', {
    //   user: {
    //     id: userId,
    //     login: userLogin
    //   }
    // });
  }
});

// POST is add
router.post('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId || !userLogin) {
    res.redirect('/');
  } else {
    const title = req.body.title.trim().replace(/ +(?= )/g, '');
    const body = req.body.body.trim();
    const isDraft = !!req.body.isDraft;
    const postId = req.body.postId;
    const url = `${tr.slugify(title)}-${Date.now().toString(36)}`;
    const categoryList = req.body.categoryList;

    if (!title || !body) {
      const fields = [];
      if (!title) fields.push('title');
      if (!body) fields.push('body');

      res.json({
        ok: false,
        error: 'Все поля должны быть заполнены!',
        fields
      });
    } else if (title.length < 3 || title.length > 64) {
      res.json({
        ok: false,
        error: 'Длина заголовка от 3 до 64 символов!',
        fields: ['title']
      });
    } else if (body.length < 3) {
      res.json({
        ok: false,
        error: 'Текст не менее 3х символов!',
        fields: ['body']
      });
    }else if (!categoryList.length) {
      res.json({
        ok: false,
        error: 'Нужно выбрать категории!',
      });
    } else if (!postId) {
      res.json({
        ok: false
      });
    } else {
      try {
        const PostCatCount = await models.Post_category.count({
          postId: postId
        });

        console.log(PostCatCount);
        console.log(postId);

        if (PostCatCount !== 0){
            models.Post_category.deleteMany({
              postId: postId
            })
            .exec()
            .then(()=>{
              console.log('success');
            })     
        }

        const post = await models.Post.findOneAndUpdate(
          {
            _id: postId,
            owner: userId
          },
          {
            title,
            body,
            url,
            owner: userId,
            status: isDraft ? 'draft' : 'published'
          },
          { new: true }
        );

        for (let index = 0; index < categoryList.length; index++) {
          models.Post_category.create({
              postId: postId,
              categoryId: categoryList[index]
          });
          
        }

        // console.log(post);

        if (!post) {
          res.json({
            ok: false,
            error: 'Пост не твой!'
          });
        } else {
          res.json({
            ok: true,
            post
          });
        }

        ///
      } catch (error) {
        res.json({
          ok: false
        });
      }
    }
  }
});

router.delete('/:id', async (req, res) => {

  const postId = req.params.id;

  const t = await models.Post.find({
    _id: postId
  });
  console.log(t);

  const postOne = await models.Post.findById(postId).populate('uploads');
  
  console.log(postOne);


  models.Post.deleteOne({_id: postId})
  .exec()
  .then(()=> {
    models.Like.deleteMany({postId: postId})
    .exec()
    .then(()=>{
        models.Post_category.deleteMany({postId: postId})
        .exec()
        .then(()=> {
          models.Comment.deleteMany({post: postId})
          .exec()
          .then(()=>{
            if(postOne.uploads.length !== 0){
              for (let index = 0; index < postOne.uploads.length; index++) {
                models.Upload.deleteOne({_id: postOne.uploads[index].id})
                .exec()
                .then(()=>{
                    res.json({ok: true});
                })              
              }
            }
            else{
              res.json({ok: true});
            }
          })
        });
      });
    });
  });
module.exports = router;

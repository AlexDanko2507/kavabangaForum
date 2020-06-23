const express = require('express');
const router = express.Router();
const moment = require('moment');
moment.locale('ru');
const showdown = require('showdown');

const config = require('../config');
const models = require('../models');

async function posts(req, res) {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;
  const categoryId = 0;

  try {
    let posts = await models.Post.find({
      status: 'published'
    })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate('owner')
      .populate('uploads')
      .sort({ createdAt: -1 });

    const converter = new showdown.Converter();

    posts = posts.map(post => {
      let body = post.body;
      if (post.uploads.length) {
        post.uploads.forEach(upload => {
          body = body.replace(
            `image${upload.id}`,
            `/${config.DESTINATION}${upload.path}`
          );
        });
      }

      return Object.assign(post, {
        body: converter.makeHtml(body)
      });
    });

    // console.log(posts);

    const count = await models.Post.count();
    const category = await models.Category.find({});

    res.render('archive/index', {
      posts,
      categoryId,
      category,
      current: page,
      pages: Math.ceil(count / perPage),
      user: {
        id: userId,
        login: userLogin
      }
    });
  } catch (error) {
    throw new Error('Server Error');
  }
}

// routers
router.get('/', (req, res) => posts(req, res));
router.get('/archive/:page', (req, res) => posts(req, res));

router.get('/posts/:post', async (req, res, next) => {
  const url = req.params.post.trim().replace(/ +(?= )/g, '');
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!url) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  } else {
    try {
      const categoryId = 0;
      const category = await models.Category.find({});
      const post = await models.Post.findOne({
        url,
        status: 'published'
      }).populate('uploads')
        .populate('owner');

      if (!post) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
      } else {
        const comments = await models.Comment.find({
          post: post.id,
          parent: { $exists: false }
        });
        // .populate({
        //   path: 'children',
        //   populate: {
        //     path: 'children',
        //     populate: {
        //       path: 'children'
        //     }
        //   }
        // });

        // console.log(comments);

        //
        const converter = new showdown.Converter();

        let body = post.body;
        if (post.uploads.length) {
          post.uploads.forEach(upload => {
            body = body.replace(
              `image${upload.id}`,
              `/${config.DESTINATION}${upload.path}`
            );
          });
        }
        if(!userId)
        console.log(userId, userLogin);
        res.render('post/post', {
          post: Object.assign(post, {
            body: converter.makeHtml(body)
          }),
          category,
          categoryId,
          comments,
          moment,
          user: {
            id: userId,
            login: userLogin
          }
        });
      }
    } catch (error) {
      throw new Error('Server Error');
    }
  }
});

// users posts
router.get('/users/:login/:page*?', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;
  const login = req.params.login;
  const categoryId = 0;

  try {
    const category = await models.Category.find({});
    const user = await models.User.findOne({
      login
    });

    let posts = await models.Post.find({
      owner: user.id,
      status: 'published'
    })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .populate('uploads')
      .populate('owner');

    const count = await models.Post.count({
      owner: user.id
    });

    console.log(posts);

    const converter = new showdown.Converter();

    posts = posts.map(post => {
      let body = post.body;
      if (post.uploads.length) {
        post.uploads.forEach(upload => {
          body = body.replace(
            `image${upload.id}`,
            `/${config.DESTINATION}${upload.path}`
          );
        });
      }

      return Object.assign(post, {
        body: converter.makeHtml(body)
      });
    });

    console.log('00000000000000000000000000000000000000000000000000000000');
    console.log(posts);

    res.render('archive/user', {
      posts,
      category,
      categoryId,
      _user: user,
      current: page,
      pages: Math.ceil(count / perPage),
      user: {
        id: userId,
        login: userLogin
      }
    });
  } catch (error) {
    throw new Error('Server Error');
  }
});

//caterogy post
router.get('/categories/:categoryId/:page*?', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;
  const categoryId = req.params.categoryId;

  //console.log(categoryId);
  try {
    const category = await models.Category.find({});

    let categoryOne = await models.Post_category.find({
      categoryId: categoryId
    })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .sort({ createdAt: -1 })
    .populate('postId');

    const count = await models.Post_category.count({
      categoryId: categoryId
    });

    let posts = [];
    if (count !== 0)
    {
    let post = await models.Post.find({
      _id: categoryOne[0].postId.id,
      status: 'published'
    })
      .sort({ createdAt: -1 })
      .populate('uploads')
      .populate('owner');
      posts = post;
      for (let index = 1; index < categoryOne.length; index++) {
        let p = await models.Post.find({
          _id: categoryOne[index].postId.id,
          status: 'published'
        })
        .sort({ createdAt: -1 })
        .populate('uploads')
        .populate('owner');
        posts = posts.concat(p);
        //console.log(post.concat(p));
      }
    }


    console.log(posts);
    // let posts = await models.Post.find({
    //   owner: user.id
    // })
    //   .skip(perPage * page - perPage)
    //   .limit(perPage)
    //   .sort({ createdAt: -1 })
    //   .populate('uploads');


    //console.log(count);

    const converter = new showdown.Converter();

    posts = posts.map(post => {
      let body = post.body;
      if (post.uploads.length) {
        post.uploads.forEach(upload => {
          body = body.replace(
            `image${upload.id}`,
            `/${config.DESTINATION}${upload.path}`
          );
        });
      }

      return Object.assign(post, {
        body: converter.makeHtml(body)
      });
    });

    res.render('archive/category', {
      posts,
      category,
      categoryId,
      current: page,
      pages: Math.ceil(count / perPage),
      user: {
        id: userId,
        login: userLogin
      }
    });
  } catch (error) {
    throw new Error('Server Error');
  }
});

router.post('/posts/:post', async (req, res) => {
  const userId = req.session.userId;
  const postId = req.body.postId;
  console.log(postId ,userId);
try {
    const post = await models.Post.find({
      _id: postId
    });

    const likeCount = post[0].likeCount;

    const checkLike = await models.Like.find({
      postId: postId,
      userId: userId
    });
    
    if (checkLike.length === 0)
    {
      models.Like.create({
        postId,
        userId
      }).then(()=>{
        models.Post.findByIdAndUpdate(
          postId,
          {
            likeCount: likeCount+1,
          },
          {new: true}
        ).then(post => {
          console.log(post.likeCount);
          res.json({
          likeCount: post.likeCount
          });
        })
      })
    }
    else{
      models.Like.findOneAndDelete({
        postId,
        userId
      }).then(()=>{
        models.Post.findByIdAndUpdate(
          postId,
          {
            likeCount: likeCount-1,
          },
          {new: true}
        ).then(post => {
          console.log(post.likeCount);
          res.json({
          likeCount: post.likeCount
          });
        })
      })
    }
} catch (error) {
  throw new Error('Server Error');
}

});

module.exports = router;